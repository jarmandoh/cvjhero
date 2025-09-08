export interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  privateKey?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  template: string;
  variables: string[];
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
  subject?: string;
  service?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

export interface EmailStatus {
  sent: boolean;
  delivered?: boolean;
  opened?: boolean;
  clicked?: boolean;
  bounced?: boolean;
  timestamp: Date;
}

export interface AutoResponder {
  enabled: boolean;
  templateId: string;
  delay: number; // en minutos
  subject: string;
  message: string;
}

export interface EmailMetrics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}
