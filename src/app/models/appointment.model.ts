export interface Appointment {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: AppointmentStatus;
  type: AppointmentType;
  clientInfo: ClientInfo;
  notes?: string;
  meetingLink?: string;
  price?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientInfo {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
  preferredContactMethod?: 'email' | 'phone' | 'whatsapp';
  additionalInfo?: string;
}

export interface AppointmentType {
  id: string;
  name: string;
  description: string;
  duration: number; // en minutos
  price?: number;
  color: string;
  icon?: string;
  isActive: boolean;
  allowOnlineBooking: boolean;
  requiresApproval: boolean;
  bufferTime?: number; // tiempo de buffer antes/después en minutos
  maxAdvanceBooking?: number; // días máximos de anticipación
  minAdvanceBooking?: number; // horas mínimas de anticipación
  questions?: BookingQuestion[];
}

export interface BookingQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  options?: string[];
  required: boolean;
  order: number;
}

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  appointmentTypeId?: string;
  maxBookings?: number;
  currentBookings?: number;
}

export interface WorkingHours {
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, etc.
  isWorkingDay: boolean;
  startTime: string; // formato HH:mm
  endTime: string; // formato HH:mm
  breaks?: TimeBreak[];
}

export interface TimeBreak {
  startTime: string; // formato HH:mm
  endTime: string; // formato HH:mm
  title?: string;
}

export interface CalendarSettings {
  businessName: string;
  timeZone: string;
  workingHours: WorkingHours[];
  appointmentTypes: AppointmentType[];
  defaultDuration: number;
  slotInterval: number; // intervalo entre slots en minutos
  allowWeekendBookings: boolean;
  maxFutureBookingDays: number;
  minAdvanceBookingHours: number;
  autoConfirmBookings: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  customFields: BookingQuestion[];
}

export interface AvailabilityRule {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  isException: boolean; // true para bloquear tiempo, false para añadir disponibilidad
  appointmentTypeIds?: string[];
  reason?: string;
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no-show',
  RESCHEDULED = 'rescheduled'
}

export interface AppointmentRequest {
  appointmentTypeId: string;
  startDate: Date;
  clientInfo: ClientInfo;
  answers?: { [questionId: string]: any };
  notes?: string;
}

export interface BookingConfirmation {
  appointment: Appointment;
  confirmationCode: string;
  rescheduleUrl?: string;
  cancelUrl?: string;
  meetingDetails?: string;
}

// Para integraciones futuras
export interface CalendarIntegration {
  provider: 'google' | 'outlook' | 'apple' | 'other';
  isEnabled: boolean;
  syncBidirectional: boolean;
  externalCalendarId?: string;
  lastSyncAt?: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  trigger: 'booking_confirmed' | 'booking_reminder' | 'booking_cancelled' | 'booking_rescheduled';
  type: 'email' | 'sms';
  subject?: string;
  content: string;
  isActive: boolean;
  sendTimeBefore?: number; // para recordatorios, en horas
}