import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { 
  EmailConfig, 
  EmailTemplate, 
  ContactFormData, 
  EmailResponse, 
  EmailStatus,
  AutoResponder,
  EmailMetrics 
} from '../models/email.model';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly STORAGE_KEY = 'cvjhero_email_config';
  private readonly TEMPLATES_KEY = 'cvjhero_email_templates';
  private readonly METRICS_KEY = 'cvjhero_email_metrics';
  
  private emailConfigSubject = new BehaviorSubject<EmailConfig | null>(null);
  public emailConfig$ = this.emailConfigSubject.asObservable();

  // Configuración predeterminada (EmailJS)
  private defaultConfig: EmailConfig = {
    serviceId: 'service_cvjhero',
    templateId: 'template_contact',
    publicKey: 'your_public_key_here'
  };

  // Templates predeterminados
  private defaultTemplates: EmailTemplate[] = [
    {
      id: 'contact_form',
      name: 'Formulario de Contacto',
      subject: 'Nuevo mensaje de contacto de {{name}}',
      template: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> {{name}}</p>
        <p><strong>Email:</strong> {{email}}</p>
        <p><strong>Empresa:</strong> {{company}}</p>
        <p><strong>Teléfono:</strong> {{phone}}</p>
        <p><strong>Asunto:</strong> {{subject}}</p>
        <p><strong>Mensaje:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #2563eb;">
          {{message}}
        </div>
        <p><small>Enviado desde: CVJHero Portfolio</small></p>
      `,
      variables: ['name', 'email', 'company', 'phone', 'subject', 'message']
    },
    {
      id: 'auto_responder',
      name: 'Respuesta Automática',
      subject: 'Gracias por contactar conmigo - Janier Hernández',
      template: `
        <h2>¡Hola {{name}}!</h2>
        <p>Gracias por contactar conmigo. He recibido tu mensaje y me pondré en contacto contigo lo antes posible.</p>
        
        <h3>Resumen de tu consulta:</h3>
        <p><strong>Asunto:</strong> {{subject}}</p>
        <p><strong>Mensaje:</strong> {{message}}</p>
        
        <p>Normalmente respondo en un plazo de 24-48 horas durante días laborables.</p>
        
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4>Mientras tanto, puedes:</h4>
          <ul>
            <li>Revisar mi portafolio y proyectos</li>
            <li>Conectar conmigo en LinkedIn</li>
            <li>Explorar mis servicios disponibles</li>
          </ul>
        </div>
        
        <p>¡Saludos cordiales!</p>
        <p><strong>Janier Hernández</strong><br>
        Desarrollador Full Stack<br>
        <a href="mailto:contact@cvjhero.com">contact@cvjhero.com</a></p>
      `,
      variables: ['name', 'subject', 'message']
    }
  ];

  constructor() {
    this.loadConfig();
  }

  /**
   * Configura el servicio de email
   */
  configureEmail(config: EmailConfig): Observable<boolean> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      this.emailConfigSubject.next(config);
      return of(true);
    } catch (error) {
      console.error('Error saving email config:', error);
      return of(false);
    }
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): EmailConfig | null {
    return this.emailConfigSubject.value;
  }

  /**
   * Carga la configuración desde localStorage
   */
  private loadConfig(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      const config = saved ? JSON.parse(saved) : this.defaultConfig;
      this.emailConfigSubject.next(config);
    } catch (error) {
      console.error('Error loading email config:', error);
      this.emailConfigSubject.next(this.defaultConfig);
    }
  }

  /**
   * Envía un email usando la configuración actual
   */
  sendEmail(formData: ContactFormData): Observable<EmailResponse> {
    const config = this.getConfig();
    
    if (!config) {
      return of({
        success: false,
        error: 'Configuración de email no disponible',
        timestamp: new Date()
      });
    }

    // Simular envío de email (en producción se integraría con EmailJS, SendGrid, etc.)
    return this.simulateEmailSend(formData, config).pipe(
      delay(2000), // Simular latencia de red
      map(response => {
        this.updateMetrics(response);
        return response;
      }),
      catchError(error => {
        console.error('Error sending email:', error);
        return of({
          success: false,
          error: error.message || 'Error desconocido',
          timestamp: new Date()
        });
      })
    );
  }

  /**
   * Simula el envío de email (para desarrollo)
   */
  private simulateEmailSend(formData: ContactFormData, config: EmailConfig): Observable<EmailResponse> {
    // Validar datos requeridos
    if (!formData.name || !formData.email || !formData.message) {
      return of({
        success: false,
        error: 'Faltan campos obligatorios',
        timestamp: new Date()
      });
    }

    // Simular éxito/fallo aleatorio para testing
    const success = Math.random() > 0.1; // 90% éxito

    if (success) {
      // Enviar autoresponder si está habilitado
      this.sendAutoResponder(formData);
      
      return of({
        success: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      });
    } else {
      return of({
        success: false,
        error: 'Error en el servidor de email',
        timestamp: new Date()
      });
    }
  }

  /**
   * Envía respuesta automática al usuario
   */
  private sendAutoResponder(formData: ContactFormData): void {
    const autoResponder = this.getAutoResponderConfig();
    
    if (autoResponder.enabled) {
      // En producción, aquí se enviaría el email automático
      console.log('Auto-responder enviado a:', formData.email);
      console.log('Template:', autoResponder.templateId);
    }
  }

  /**
   * Obtiene configuración de auto-responder
   */
  getAutoResponderConfig(): AutoResponder {
    try {
      const saved = localStorage.getItem('cvjhero_autoresponder');
      return saved ? JSON.parse(saved) : {
        enabled: true,
        templateId: 'auto_responder',
        delay: 5,
        subject: 'Gracias por contactar conmigo',
        message: 'He recibido tu mensaje y me pondré en contacto contigo pronto.'
      };
    } catch {
      return {
        enabled: true,
        templateId: 'auto_responder',
        delay: 5,
        subject: 'Gracias por contactar conmigo',
        message: 'He recibido tu mensaje y me pondré en contacto contigo pronto.'
      };
    }
  }

  /**
   * Configura auto-responder
   */
  configureAutoResponder(config: AutoResponder): Observable<boolean> {
    try {
      localStorage.setItem('cvjhero_autoresponder', JSON.stringify(config));
      return of(true);
    } catch (error) {
      console.error('Error saving auto-responder config:', error);
      return of(false);
    }
  }

  /**
   * Obtiene templates de email
   */
  getEmailTemplates(): EmailTemplate[] {
    try {
      const saved = localStorage.getItem(this.TEMPLATES_KEY);
      return saved ? JSON.parse(saved) : this.defaultTemplates;
    } catch {
      return this.defaultTemplates;
    }
  }

  /**
   * Guarda templates de email
   */
  saveEmailTemplates(templates: EmailTemplate[]): Observable<boolean> {
    try {
      localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
      return of(true);
    } catch (error) {
      console.error('Error saving email templates:', error);
      return of(false);
    }
  }

  /**
   * Actualiza métricas de email
   */
  private updateMetrics(response: EmailResponse): void {
    try {
      const current = this.getEmailMetrics();
      
      if (response.success) {
        current.totalSent++;
        current.totalDelivered++; // En producción, esto vendría del webhook
      }
      
      // Calcular tasas
      current.openRate = current.totalSent > 0 ? (current.totalOpened / current.totalSent) * 100 : 0;
      current.clickRate = current.totalSent > 0 ? (current.totalClicked / current.totalSent) * 100 : 0;
      current.bounceRate = current.totalSent > 0 ? (current.totalBounced / current.totalSent) * 100 : 0;
      
      localStorage.setItem(this.METRICS_KEY, JSON.stringify(current));
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  }

  /**
   * Obtiene métricas de email
   */
  getEmailMetrics(): EmailMetrics {
    try {
      const saved = localStorage.getItem(this.METRICS_KEY);
      return saved ? JSON.parse(saved) : {
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalBounced: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0
      };
    } catch {
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalBounced: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0
      };
    }
  }

  /**
   * Valida una dirección de email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Obtiene el estado de un email enviado
   */
  getEmailStatus(messageId: string): Observable<EmailStatus> {
    // En producción, esto consultaría la API del proveedor de email
    return of({
      sent: true,
      delivered: Math.random() > 0.1,
      opened: Math.random() > 0.3,
      clicked: Math.random() > 0.7,
      bounced: Math.random() > 0.95,
      timestamp: new Date()
    }).pipe(delay(1000));
  }

  /**
   * Resetea las métricas
   */
  resetMetrics(): Observable<boolean> {
    try {
      localStorage.removeItem(this.METRICS_KEY);
      return of(true);
    } catch (error) {
      console.error('Error resetting metrics:', error);
      return of(false);
    }
  }
}
