import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { NewsletterService } from '../../services/newsletter.service';
import { 
  Subscriber, 
  Newsletter, 
  EmailTemplate, 
  NewsletterStatus 
} from '../../models/subscriber.model';

@Component({
  selector: 'app-newsletter-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './newsletter-manager.component.html',
  styleUrl: './newsletter-manager.component.css'
})
export class NewsletterManagerComponent implements OnInit {
  activeTab: 'subscribers' | 'newsletters' | 'templates' | 'stats' = 'subscribers';
  
  // Data
  subscribers: Subscriber[] = [];
  newsletters: Newsletter[] = [];
  templates: EmailTemplate[] = [];
  stats: any = {};
  
  // Forms
  newsletterForm: FormGroup;
  templateForm: FormGroup;
  
  // UI State
  isLoading = false;
  showNewsletterModal = false;
  showTemplateModal = false;
  selectedNewsletter: Newsletter | null = null;
  
  // Filters
  subscriberFilter = '';
  activeOnly = true;

  constructor(
    private newsletterService: NewsletterService,
    private fb: FormBuilder
  ) {
    this.newsletterForm = this.fb.group({
      title: ['', Validators.required],
      subject: ['', Validators.required],
      content: ['', Validators.required],
      template: ['1'],
      scheduledDate: ['']
    });

    this.templateForm = this.fb.group({
      name: ['', Validators.required],
      subject: ['', Validators.required],
      htmlContent: ['', Validators.required],
      previewText: ['']
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    
    // Load subscribers
    this.newsletterService.getSubscribers().subscribe(subscribers => {
      this.subscribers = subscribers;
    });
    
    // Load newsletters
    this.newsletterService.getNewsletters().subscribe(newsletters => {
      this.newsletters = newsletters;
    });
    
    // Load templates
    this.newsletterService.getTemplates().subscribe(templates => {
      this.templates = templates;
    });
    
    // Load stats
    this.newsletterService.getSubscriberStats().subscribe(stats => {
      this.stats = stats;
      this.isLoading = false;
    });
  }

  // Tab Management
  setActiveTab(tab: 'subscribers' | 'newsletters' | 'templates' | 'stats') {
    this.activeTab = tab;
  }

  // Subscriber Management
  get filteredSubscribers() {
    let filtered = this.subscribers;
    
    if (this.activeOnly) {
      filtered = filtered.filter(s => s.isActive);
    }
    
    if (this.subscriberFilter) {
      const filter = this.subscriberFilter.toLowerCase();
      filtered = filtered.filter(s => 
        s.email.toLowerCase().includes(filter) ||
        (s.name && s.name.toLowerCase().includes(filter))
      );
    }
    
    return filtered;
  }

  toggleSubscriberStatus(subscriber: Subscriber) {
    if (!subscriber.isActive) {
      // Reactivate subscriber
      subscriber.isActive = true;
    } else {
      // Unsubscribe
      this.newsletterService.unsubscribe(subscriber.id).subscribe(() => {
        this.loadData();
      });
    }
  }

  // Newsletter Management
  createNewsletter() {
    this.selectedNewsletter = null;
    this.newsletterForm.reset({ template: '1' });
    this.showNewsletterModal = true;
  }

  editNewsletter(newsletter: Newsletter) {
    this.selectedNewsletter = newsletter;
    this.newsletterForm.patchValue({
      title: newsletter.title,
      subject: newsletter.subject,
      content: newsletter.content,
      template: newsletter.template,
      scheduledDate: newsletter.scheduledDate ? 
        new Date(newsletter.scheduledDate).toISOString().slice(0, 16) : ''
    });
    this.showNewsletterModal = true;
  }

  saveNewsletter() {
    if (this.newsletterForm.valid) {
      const formData = this.newsletterForm.value;
      const newsletterData = {
        title: formData.title,
        subject: formData.subject,
        content: formData.content,
        htmlContent: this.generateHtmlContent(formData.content, formData.template),
        template: formData.template,
        status: 'draft' as NewsletterStatus,
        recipients: this.subscribers.filter(s => s.isActive).map(s => s.id),
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined
      };

      this.newsletterService.createNewsletter(newsletterData).subscribe(() => {
        this.showNewsletterModal = false;
        this.loadData();
      });
    }
  }

  sendNewsletter(newsletter: Newsletter) {
    if (confirm(`¿Enviar newsletter "${newsletter.title}" a ${newsletter.recipients.length} suscriptores?`)) {
      this.newsletterService.sendNewsletter(newsletter.id).subscribe(() => {
        this.loadData();
      });
    }
  }

  private generateHtmlContent(content: string, templateId: string): string {
    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      return template.htmlContent
        .replace('{{content}}', content)
        .replace('{{month}}', new Date().toLocaleString('es', { month: 'long', year: 'numeric' }));
    }
    return content;
  }

  // Template Management
  createTemplate() {
    this.templateForm.reset();
    this.showTemplateModal = true;
  }

  saveTemplate() {
    if (this.templateForm.valid) {
      const templateData = {
        ...this.templateForm.value,
        isDefault: false,
        variables: [
          { name: 'content', placeholder: '{{content}}', type: 'text' as const, required: true },
          { name: 'month', placeholder: '{{month}}', type: 'text' as const, required: true }
        ]
      };

      this.newsletterService.createTemplate(templateData).subscribe(() => {
        this.showTemplateModal = false;
        this.loadData();
      });
    }
  }

  // Utility Methods
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-ES');
  }

  getSentNewslettersCount(): number {
    return this.newsletters.filter(n => n.status === 'sent').length;
  }

  getStatusBadgeClass(status: NewsletterStatus): string {
    const classes = {
      draft: 'status-draft',
      scheduled: 'status-scheduled',
      sent: 'status-sent',
      cancelled: 'status-cancelled'
    };
    return classes[status] || 'status-draft';
  }

  getStatusText(status: NewsletterStatus): string {
    const texts = {
      draft: 'Borrador',
      scheduled: 'Programado',
      sent: 'Enviado',
      cancelled: 'Cancelado'
    };
    return texts[status] || 'Desconocido';
  }

  exportSubscribers() {
    const csvContent = this.generateSubscribersCsv();
    this.downloadCsv(csvContent, 'suscriptores.csv');
  }

  private generateSubscribersCsv(): string {
    const headers = ['Email', 'Nombre', 'Fecha Suscripción', 'Estado', 'Frecuencia', 'Temas'];
    const rows = this.subscribers.map(sub => [
      sub.email,
      sub.name || '',
      this.formatDate(sub.subscriptionDate),
      sub.isActive ? 'Activo' : 'Inactivo',
      sub.preferences.frequency,
      sub.preferences.topics.join('; ')
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private downloadCsv(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
