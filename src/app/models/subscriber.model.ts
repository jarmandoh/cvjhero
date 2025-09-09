export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscriptionDate: Date;
  isActive: boolean;
  preferences: NewsletterPreferences;
  lastOpenDate?: Date;
  totalOpens: number;
  totalClicks: number;
  source: SubscriptionSource;
}

export interface NewsletterPreferences {
  frequency: 'weekly' | 'monthly' | 'biweekly';
  topics: string[];
  language: 'es' | 'en';
}

export interface Newsletter {
  id: string;
  title: string;
  subject: string;
  content: string;
  htmlContent: string;
  createdDate: Date;
  scheduledDate?: Date;
  sentDate?: Date;
  status: NewsletterStatus;
  recipients: string[];
  metrics: NewsletterMetrics;
  template: string;
}

export interface NewsletterMetrics {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  bounceRate: number;
  unsubscribeRate: number;
  openRate: number;
  clickRate: number;
}

export type SubscriptionSource = 'website' | 'contact-form' | 'blog' | 'projects' | 'manual';
export type NewsletterStatus = 'draft' | 'scheduled' | 'sent' | 'cancelled';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  previewText: string;
  isDefault: boolean;
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  placeholder: string;
  type: 'text' | 'date' | 'url' | 'image';
  required: boolean;
}
