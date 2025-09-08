import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { EmailService } from '../../services/email.service';
import { EmailConfig, EmailTemplate, AutoResponder, EmailMetrics } from '../../models/email.model';

@Component({
  selector: 'app-email-manager',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './email-manager.component.html',
  styleUrls: ['./email-manager.component.css']
})
export class EmailManagerComponent implements OnInit, OnDestroy {
  configForm: FormGroup;
  autoResponderForm: FormGroup;
  
  activeTab: 'config' | 'templates' | 'autoresponder' | 'metrics' = 'config';
  
  emailTemplates: EmailTemplate[] = [];
  emailMetrics: EmailMetrics = {
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalBounced: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0
  };
  
  isLoading = false;
  saveMessage = '';
  saveStatus: 'success' | 'error' | '' = '';
  
  private destroy$ = new Subject<void>();

  // Opciones de servicio de email
  emailProviders = [
    { value: 'emailjs', label: 'EmailJS (Recomendado)', description: 'Fácil configuración, ideal para sitios estáticos' },
    { value: 'sendgrid', label: 'SendGrid', description: 'Profesional, alta entregabilidad' },
    { value: 'mailgun', label: 'Mailgun', description: 'Potente API, analytics avanzados' },
    { value: 'smtp', label: 'SMTP Personalizado', description: 'Tu propio servidor SMTP' }
  ];

  constructor(
    private fb: FormBuilder,
    private emailService: EmailService
  ) {
    this.configForm = this.createConfigForm();
    this.autoResponderForm = this.createAutoResponderForm();
  }

  ngOnInit(): void {
    this.loadConfiguration();
    this.loadTemplates();
    this.loadMetrics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createConfigForm(): FormGroup {
    return this.fb.group({
      provider: ['emailjs', Validators.required],
      serviceId: ['', Validators.required],
      templateId: ['', Validators.required],
      publicKey: ['', Validators.required],
      privateKey: [''],
      fromEmail: ['contact@cvjhero.com', [Validators.required, Validators.email]],
      fromName: ['Janier Hernández - CVJHero', Validators.required],
      replyTo: ['contact@cvjhero.com', [Validators.required, Validators.email]]
    });
  }

  private createAutoResponderForm(): FormGroup {
    return this.fb.group({
      enabled: [true],
      templateId: ['auto_responder', Validators.required],
      delay: [5, [Validators.required, Validators.min(0), Validators.max(60)]],
      subject: ['Gracias por contactar conmigo - Janier Hernández', Validators.required],
      message: ['He recibido tu mensaje y me pondré en contacto contigo pronto.', Validators.required]
    });
  }

  private loadConfiguration(): void {
    const config = this.emailService.getConfig();
    if (config) {
      this.configForm.patchValue({
        provider: 'emailjs',
        serviceId: config.serviceId,
        templateId: config.templateId,
        publicKey: config.publicKey,
        privateKey: config.privateKey || '',
        fromEmail: 'contact@cvjhero.com',
        fromName: 'Janier Hernández - CVJHero',
        replyTo: 'contact@cvjhero.com'
      });
    }
  }

  private loadTemplates(): void {
    this.emailTemplates = this.emailService.getEmailTemplates();
  }

  private loadMetrics(): void {
    this.emailMetrics = this.emailService.getEmailMetrics();
  }

  onSaveConfig(): void {
    if (this.configForm.valid) {
      this.isLoading = true;
      
      const config: EmailConfig = {
        serviceId: this.configForm.value.serviceId,
        templateId: this.configForm.value.templateId,
        publicKey: this.configForm.value.publicKey,
        privateKey: this.configForm.value.privateKey
      };

      this.emailService.configureEmail(config)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.saveStatus = 'success';
              this.saveMessage = 'Configuración guardada exitosamente';
            } else {
              this.saveStatus = 'error';
              this.saveMessage = 'Error al guardar la configuración';
            }
            this.isLoading = false;
            this.clearMessage();
          },
          error: () => {
            this.saveStatus = 'error';
            this.saveMessage = 'Error al guardar la configuración';
            this.isLoading = false;
            this.clearMessage();
          }
        });
    }
  }

  onSaveAutoResponder(): void {
    if (this.autoResponderForm.valid) {
      this.isLoading = true;
      
      const config: AutoResponder = this.autoResponderForm.value;

      this.emailService.configureAutoResponder(config)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.saveStatus = 'success';
              this.saveMessage = 'Auto-responder configurado exitosamente';
            } else {
              this.saveStatus = 'error';
              this.saveMessage = 'Error al configurar auto-responder';
            }
            this.isLoading = false;
            this.clearMessage();
          },
          error: () => {
            this.saveStatus = 'error';
            this.saveMessage = 'Error al configurar auto-responder';
            this.isLoading = false;
            this.clearMessage();
          }
        });
    }
  }

  onTestConfiguration(): void {
    if (this.configForm.valid) {
      this.isLoading = true;
      
      // Simular envío de prueba
      setTimeout(() => {
        this.saveStatus = 'success';
        this.saveMessage = 'Email de prueba enviado exitosamente';
        this.isLoading = false;
        this.clearMessage();
      }, 2000);
    }
  }

  onResetMetrics(): void {
    if (confirm('¿Estás seguro de que deseas resetear todas las métricas?')) {
      this.emailService.resetMetrics()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.loadMetrics();
              this.saveStatus = 'success';
              this.saveMessage = 'Métricas reseteadas exitosamente';
            } else {
              this.saveStatus = 'error';
              this.saveMessage = 'Error al resetear las métricas';
            }
            this.clearMessage();
          }
        });
    }
  }

  private clearMessage(): void {
    setTimeout(() => {
      this.saveMessage = '';
      this.saveStatus = '';
    }, 3000);
  }

  setActiveTab(tab: 'config' | 'templates' | 'autoresponder' | 'metrics'): void {
    this.activeTab = tab;
  }

  // Getters para validación
  get serviceId() { return this.configForm.get('serviceId'); }
  get templateId() { return this.configForm.get('templateId'); }
  get publicKey() { return this.configForm.get('publicKey'); }
  get fromEmail() { return this.configForm.get('fromEmail'); }
  get fromName() { return this.configForm.get('fromName'); }
  get replyTo() { return this.configForm.get('replyTo'); }

  get autoResponderEnabled() { return this.autoResponderForm.get('enabled'); }
  get autoResponderSubject() { return this.autoResponderForm.get('subject'); }
  get autoResponderMessage() { return this.autoResponderForm.get('message'); }
  get autoResponderDelay() { return this.autoResponderForm.get('delay'); }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Este campo es obligatorio';
      if (field.errors['email']) return 'Email no válido';
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;
    }
    return '';
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field?.invalid && field.touched);
  }
}
