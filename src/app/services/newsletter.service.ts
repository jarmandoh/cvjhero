import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { 
  Subscriber, 
  Newsletter, 
  EmailTemplate, 
  NewsletterPreferences,
  SubscriptionSource,
  NewsletterStatus 
} from '../models/subscriber.model';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private subscribers: Subscriber[] = [];
  private newsletters: Newsletter[] = [];
  private templates: EmailTemplate[] = [];
  
  private subscribersSubject = new BehaviorSubject<Subscriber[]>([]);
  private newslettersSubject = new BehaviorSubject<Newsletter[]>([]);
  private templatesSubject = new BehaviorSubject<EmailTemplate[]>([]);

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Datos de ejemplo para desarrollo
    this.templates = [
      {
        id: '1',
        name: 'Template Principal',
        subject: 'Newsletter de Janier Hernández - {{month}}',
        htmlContent: this.getDefaultTemplate(),
        previewText: 'Novedades, proyectos y contenido técnico',
        isDefault: true,
        variables: [
          { name: 'month', placeholder: '{{month}}', type: 'text', required: true },
          { name: 'featured_project', placeholder: '{{featured_project}}', type: 'text', required: false },
          { name: 'blog_posts', placeholder: '{{blog_posts}}', type: 'text', required: false }
        ]
      }
    ];

    this.subscribers = [
      {
        id: '1',
        email: 'ejemplo@email.com',
        name: 'Usuario Ejemplo',
        subscriptionDate: new Date('2024-01-15'),
        isActive: true,
        preferences: {
          frequency: 'monthly',
          topics: ['desarrollo-web', 'angular', 'tecnologia'],
          language: 'es'
        },
        totalOpens: 5,
        totalClicks: 3,
        source: 'website',
        lastOpenDate: new Date('2024-02-20')
      }
    ];

    this.newsletters = [
      {
        id: '1',
        title: 'Newsletter Febrero 2024',
        subject: 'Novedades de Febrero - Nuevos Proyectos y Artículos',
        content: 'Contenido del newsletter...',
        htmlContent: this.getNewsletterExample(),
        createdDate: new Date('2024-02-01'),
        sentDate: new Date('2024-02-05'),
        status: 'sent',
        recipients: ['1'],
        template: '1',
        metrics: {
          totalSent: 1,
          totalOpened: 1,
          totalClicked: 1,
          bounceRate: 0,
          unsubscribeRate: 0,
          openRate: 100,
          clickRate: 100
        }
      }
    ];

    this.subscribersSubject.next(this.subscribers);
    this.newslettersSubject.next(this.newsletters);
    this.templatesSubject.next(this.templates);
  }

  // Suscripción
  subscribe(email: string, name?: string, source: SubscriptionSource = 'website', preferences?: Partial<NewsletterPreferences>): Observable<boolean> {
    return new Observable(observer => {
      // Simular validación de email
      if (!this.isValidEmail(email)) {
        observer.error('Email inválido');
        return;
      }

      // Verificar si ya existe
      if (this.subscribers.find(s => s.email === email)) {
        observer.error('Este email ya está suscrito');
        return;
      }

      // Crear nuevo suscriptor
      const newSubscriber: Subscriber = {
        id: this.generateId(),
        email,
        name,
        subscriptionDate: new Date(),
        isActive: true,
        preferences: {
          frequency: preferences?.frequency || 'monthly',
          topics: preferences?.topics || ['desarrollo-web'],
          language: preferences?.language || 'es'
        },
        totalOpens: 0,
        totalClicks: 0,
        source
      };

      this.subscribers.push(newSubscriber);
      this.subscribersSubject.next([...this.subscribers]);
      
      setTimeout(() => {
        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }

  // Desuscripción
  unsubscribe(subscriberId: string): Observable<boolean> {
    return of(true).pipe(
      delay(500),
      map(() => {
        const index = this.subscribers.findIndex(s => s.id === subscriberId);
        if (index !== -1) {
          this.subscribers[index].isActive = false;
          this.subscribersSubject.next([...this.subscribers]);
          return true;
        }
        return false;
      })
    );
  }

  // Obtener suscriptores
  getSubscribers(): Observable<Subscriber[]> {
    return this.subscribersSubject.asObservable();
  }

  getActiveSubscribers(): Observable<Subscriber[]> {
    return this.subscribersSubject.pipe(
      map(subscribers => subscribers.filter(s => s.isActive))
    );
  }

  // Gestión de newsletters
  createNewsletter(newsletter: Omit<Newsletter, 'id' | 'createdDate' | 'metrics'>): Observable<Newsletter> {
    const newNewsletter: Newsletter = {
      ...newsletter,
      id: this.generateId(),
      createdDate: new Date(),
      metrics: {
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        bounceRate: 0,
        unsubscribeRate: 0,
        openRate: 0,
        clickRate: 0
      }
    };

    return of(newNewsletter).pipe(
      delay(500),
      map(newsletter => {
        this.newsletters.push(newsletter);
        this.newslettersSubject.next([...this.newsletters]);
        return newsletter;
      })
    );
  }

  getNewsletters(): Observable<Newsletter[]> {
    return this.newslettersSubject.asObservable();
  }

  sendNewsletter(newsletterId: string): Observable<boolean> {
    return of(true).pipe(
      delay(2000), // Simular envío
      map(() => {
        const newsletter = this.newsletters.find(n => n.id === newsletterId);
        if (newsletter) {
          newsletter.status = 'sent';
          newsletter.sentDate = new Date();
          newsletter.metrics.totalSent = this.subscribers.filter(s => s.isActive).length;
          this.newslettersSubject.next([...this.newsletters]);
          return true;
        }
        return false;
      })
    );
  }

  // Templates
  getTemplates(): Observable<EmailTemplate[]> {
    return this.templatesSubject.asObservable();
  }

  createTemplate(template: Omit<EmailTemplate, 'id'>): Observable<EmailTemplate> {
    const newTemplate: EmailTemplate = {
      ...template,
      id: this.generateId()
    };

    return of(newTemplate).pipe(
      delay(300),
      map(template => {
        this.templates.push(template);
        this.templatesSubject.next([...this.templates]);
        return template;
      })
    );
  }

  // Métricas y estadísticas
  getSubscriberStats(): Observable<any> {
    return this.subscribersSubject.pipe(
      map(subscribers => ({
        total: subscribers.length,
        active: subscribers.filter(s => s.isActive).length,
        inactive: subscribers.filter(s => !s.isActive).length,
        bySource: this.groupBySource(subscribers),
        byFrequency: this.groupByFrequency(subscribers),
        recentSubscriptions: subscribers
          .filter(s => this.isRecentSubscription(s.subscriptionDate))
          .length
      }))
    );
  }

  // Utilidades privadas
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private groupBySource(subscribers: Subscriber[]) {
    return subscribers.reduce((acc, subscriber) => {
      acc[subscriber.source] = (acc[subscriber.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByFrequency(subscribers: Subscriber[]) {
    return subscribers.reduce((acc, subscriber) => {
      acc[subscriber.preferences.frequency] = (acc[subscriber.preferences.frequency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private isRecentSubscription(date: Date): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date > thirtyDaysAgo;
  }

  private getDefaultTemplate(): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Newsletter - Janier Hernández</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Newsletter {{month}}</h1>
            <p>Janier Hernández - Desarrollador Web</p>
        </div>
        <div class="content">
            <h2>¡Hola!</h2>
            <p>Aquí tienes las novedades de este mes:</p>
            
            <h3>Proyecto Destacado</h3>
            <p>{{featured_project}}</p>
            
            <h3>Nuevos Artículos</h3>
            <p>{{blog_posts}}</p>
            
            <p>¡Gracias por seguir mi trabajo!</p>
        </div>
        <div class="footer">
            <p>© 2024 Janier Hernández. Todos los derechos reservados.</p>
            <p><a href="{{unsubscribe_url}}">Desuscribirse</a></p>
        </div>
    </body>
    </html>`;
  }

  private getNewsletterExample(): string {
    return this.getDefaultTemplate()
      .replace('{{month}}', 'Febrero 2024')
      .replace('{{featured_project}}', 'Sistema de gestión de inventarios con Angular y .NET')
      .replace('{{blog_posts}}', 'Nuevos artículos sobre optimización de rendimiento en Angular');
  }
}
