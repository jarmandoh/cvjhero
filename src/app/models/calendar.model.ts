export interface CalendlyEvent {
  id: string;
  name: string;
  description: string;
  duration: number; // en minutos
  calendlyUrl: string;
  color: string;
  icon: string;
  available: boolean;
  price?: number;
  features: string[];
}

export interface CalendlyBooking {
  id: string;
  eventType: string;
  scheduledTime: Date;
  duration: number;
  attendee: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    message?: string;
  };
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  createdAt: Date;
  updatedAt: Date;
  meetingLink?: string;
  rescheduleUrl?: string;
  cancelUrl?: string;
}

export interface CalendlySettings {
  username: string; // Tu username de Calendly
  hideEventDetails: boolean;
  hideLandingPageDetails: boolean;
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  timezone: string;
  embed: {
    height: number;
    minWidth: number;
  };
}

export interface MeetingType {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: string;
  color: string;
  calendlyUrl: string;
  features: string[];
  recommended?: boolean;
  price?: string;
}

export interface CalendlyWidgetConfig {
  url: string;
  parentElement: HTMLElement | null;
  prefill?: {
    name?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    customAnswers?: Record<string, string>;
  };
  utm?: {
    utmCampaign?: string;
    utmSource?: string;
    utmMedium?: string;
    utmContent?: string;
    utmTerm?: string;
  };
}

export interface PreMeetingInfo {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
  preferredTime: string;
}
