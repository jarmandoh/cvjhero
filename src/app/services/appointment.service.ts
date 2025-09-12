import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, map, delay } from 'rxjs';
import { 
  Appointment, 
  AppointmentType, 
  CalendarSettings, 
  WorkingHours, 
  TimeSlot, 
  AppointmentRequest, 
  BookingConfirmation, 
  AppointmentStatus,
  ClientInfo,
  AvailabilityRule
} from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  private settingsSubject = new BehaviorSubject<CalendarSettings | null>(null);
  private appointmentTypesSubject = new BehaviorSubject<AppointmentType[]>([]);

  public appointments$ = this.appointmentsSubject.asObservable();
  public settings$ = this.settingsSubject.asObservable();
  public appointmentTypes$ = this.appointmentTypesSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Configuración mock
    const mockSettings: CalendarSettings = {
      businessName: 'Janier Hernández - Desarrollo Web',
      timeZone: 'America/Bogota',
      defaultDuration: 60,
      slotInterval: 30,
      allowWeekendBookings: false,
      maxFutureBookingDays: 60,
      minAdvanceBookingHours: 24,
      autoConfirmBookings: true,
      emailNotifications: true,
      smsNotifications: false,
      workingHours: this.getDefaultWorkingHours(),
      appointmentTypes: this.getDefaultAppointmentTypes(),
      customFields: []
    };

    // Citas mock
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        title: 'Consulta Gratuita - Juan Pérez',
        description: 'Consulta inicial sobre proyecto de e-commerce',
        startDate: new Date(2025, 8, 15, 10, 0), // 15 septiembre 2025, 10:00
        endDate: new Date(2025, 8, 15, 11, 0),
        status: AppointmentStatus.CONFIRMED,
        type: this.getDefaultAppointmentTypes()[0],
        clientInfo: {
          name: 'Juan Pérez',
          email: 'juan.perez@email.com',
          phone: '+57 300 123 4567',
          company: 'TechStart SAS',
          projectType: 'E-commerce',
          budget: '$5,000 - $10,000'
        },
        createdAt: new Date(2025, 8, 10),
        updatedAt: new Date(2025, 8, 10)
      },
      {
        id: '2',
        title: 'Consultoría Técnica - María González',
        description: 'Revisión de arquitectura de aplicación móvil',
        startDate: new Date(2025, 8, 16, 14, 0), // 16 septiembre 2025, 14:00
        endDate: new Date(2025, 8, 16, 15, 30),
        status: AppointmentStatus.PENDING,
        type: this.getDefaultAppointmentTypes()[1],
        clientInfo: {
          name: 'María González',
          email: 'maria.gonzalez@startup.com',
          phone: '+57 310 987 6543',
          company: 'StartupInnovate',
          projectType: 'Aplicación Móvil',
          budget: '$10,000 - $25,000'
        },
        price: 150000,
        createdAt: new Date(2025, 8, 12),
        updatedAt: new Date(2025, 8, 12)
      }
    ];

    this.settingsSubject.next(mockSettings);
    this.appointmentsSubject.next(mockAppointments);
    this.appointmentTypesSubject.next(this.getDefaultAppointmentTypes());
  }

  private getDefaultWorkingHours(): WorkingHours[] {
    return [
      { dayOfWeek: 0, isWorkingDay: false, startTime: '', endTime: '' }, // Domingo
      { dayOfWeek: 1, isWorkingDay: true, startTime: '09:00', endTime: '18:00' }, // Lunes
      { dayOfWeek: 2, isWorkingDay: true, startTime: '09:00', endTime: '18:00' }, // Martes
      { dayOfWeek: 3, isWorkingDay: true, startTime: '09:00', endTime: '18:00' }, // Miércoles
      { dayOfWeek: 4, isWorkingDay: true, startTime: '09:00', endTime: '18:00' }, // Jueves
      { dayOfWeek: 5, isWorkingDay: true, startTime: '09:00', endTime: '17:00' }, // Viernes
      { dayOfWeek: 6, isWorkingDay: false, startTime: '', endTime: '' } // Sábado
    ];
  }

  private getDefaultAppointmentTypes(): AppointmentType[] {
    return [
      {
        id: 'consulta-gratuita',
        name: 'Consulta Gratuita',
        description: 'Consulta inicial de 60 minutos para conocer tu proyecto y cómo puedo ayudarte',
        duration: 60,
        price: 0,
        color: '#10B981',
        icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
        isActive: true,
        allowOnlineBooking: true,
        requiresApproval: false,
        bufferTime: 15,
        maxAdvanceBooking: 30,
        minAdvanceBooking: 24,
        questions: [
          {
            id: 'project-type',
            question: '¿Qué tipo de proyecto tienes en mente?',
            type: 'select',
            options: ['Desarrollo Web', 'Aplicación Móvil', 'E-commerce', 'Consultoría Técnica', 'Otro'],
            required: true,
            order: 1
          },
          {
            id: 'timeline',
            question: '¿Cuál es tu cronograma esperado?',
            type: 'select',
            options: ['Inmediato (1-2 semanas)', 'Corto plazo (1 mes)', 'Mediano plazo (2-3 meses)', 'Largo plazo (3+ meses)', 'Flexible'],
            required: true,
            order: 2
          },
          {
            id: 'budget',
            question: '¿Cuál es tu presupuesto estimado?',
            type: 'select',
            options: ['Menos de $1,000', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000 - $25,000', 'Más de $25,000', 'Por definir'],
            required: false,
            order: 3
          }
        ]
      },
      {
        id: 'consultoria-tecnica',
        name: 'Consultoría Técnica',
        description: 'Sesión de consultoría técnica especializada de 90 minutos',
        duration: 90,
        price: 150000,
        color: '#3B82F6',
        icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        isActive: true,
        allowOnlineBooking: true,
        requiresApproval: true,
        bufferTime: 30,
        maxAdvanceBooking: 60,
        minAdvanceBooking: 48,
        questions: [
          {
            id: 'tech-area',
            question: '¿En qué área técnica necesitas consultoría?',
            type: 'select',
            options: ['Arquitectura de Software', 'Performance y Optimización', 'Seguridad', 'DevOps', 'Code Review', 'Migración Tecnológica'],
            required: true,
            order: 1
          },
          {
            id: 'current-challenge',
            question: 'Describe brevemente el desafío actual',
            type: 'textarea',
            required: true,
            order: 2
          }
        ]
      },
      {
        id: 'presentacion-proyecto',
        name: 'Presentación de Proyecto',
        description: 'Presentación detallada de propuesta y alcance del proyecto',
        duration: 45,
        price: 0,
        color: '#8B5CF6',
        icon: 'M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M7 10h10v4H7v-4z',
        isActive: true,
        allowOnlineBooking: true,
        requiresApproval: false,
        bufferTime: 15,
        maxAdvanceBooking: 14,
        minAdvanceBooking: 24,
        questions: []
      },
      {
        id: 'seguimiento-proyecto',
        name: 'Seguimiento de Proyecto',
        description: 'Reunión de seguimiento y revisión de avances',
        duration: 30,
        price: 0,
        color: '#F59E0B',
        icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
        isActive: true,
        allowOnlineBooking: false,
        requiresApproval: false,
        bufferTime: 10,
        maxAdvanceBooking: 30,
        minAdvanceBooking: 4,
        questions: []
      }
    ];
  }

  // Métodos públicos para obtener datos
  getAppointments(startDate?: Date, endDate?: Date): Observable<Appointment[]> {
    return this.appointments$.pipe(
      map(appointments => {
        if (!startDate && !endDate) return appointments;
        
        return appointments.filter(appointment => {
          const appointmentDate = appointment.startDate;
          if (startDate && appointmentDate < startDate) return false;
          if (endDate && appointmentDate > endDate) return false;
          return true;
        });
      })
    );
  }

  getAppointmentById(id: string): Observable<Appointment | null> {
    return this.appointments$.pipe(
      map(appointments => appointments.find(a => a.id === id) || null)
    );
  }

  getAppointmentTypes(): Observable<AppointmentType[]> {
    return this.appointmentTypes$;
  }

  getAppointmentTypeById(id: string): Observable<AppointmentType | null> {
    return this.appointmentTypes$.pipe(
      map(types => types.find(t => t.id === id) || null)
    );
  }

  getSettings(): Observable<CalendarSettings | null> {
    return this.settings$;
  }

  // Métodos para obtener disponibilidad
  getAvailableSlots(date: Date, appointmentTypeId: string): Observable<TimeSlot[]> {
    return this.settings$.pipe(
      map(settings => {
        if (!settings) return [];

        const dayOfWeek = date.getDay();
        const workingHours = settings.workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
        
        if (!workingHours || !workingHours.isWorkingDay) return [];

        const appointmentType = settings.appointmentTypes.find(at => at.id === appointmentTypeId);
        if (!appointmentType) return [];

        return this.generateTimeSlots(date, workingHours, appointmentType, settings);
      }),
      delay(300) // Simular llamada a API
    );
  }

  private generateTimeSlots(
    date: Date, 
    workingHours: WorkingHours, 
    appointmentType: AppointmentType, 
    settings: CalendarSettings
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = workingHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = workingHours.endTime.split(':').map(Number);

    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    const slotDuration = appointmentType.duration;
    const slotInterval = settings.slotInterval;

    let currentSlot = new Date(startTime);

    while (currentSlot.getTime() + (slotDuration * 60000) <= endTime.getTime()) {
      const slotEnd = new Date(currentSlot.getTime() + (slotDuration * 60000));
      
      const isAvailable = this.isSlotAvailable(currentSlot, slotEnd);

      slots.push({
        id: `${currentSlot.getTime()}`,
        startTime: new Date(currentSlot),
        endTime: slotEnd,
        isAvailable,
        appointmentTypeId: appointmentType.id
      });

      currentSlot = new Date(currentSlot.getTime() + (slotInterval * 60000));
    }

    return slots;
  }

  private isSlotAvailable(startTime: Date, endTime: Date): boolean {
    const appointments = this.appointmentsSubject.value;
    
    // Verificar si hay conflictos con citas existentes
    const hasConflict = appointments.some(appointment => {
      if (appointment.status === AppointmentStatus.CANCELLED) return false;
      
      return (
        (startTime >= appointment.startDate && startTime < appointment.endDate) ||
        (endTime > appointment.startDate && endTime <= appointment.endDate) ||
        (startTime <= appointment.startDate && endTime >= appointment.endDate)
      );
    });

    return !hasConflict;
  }

  // Métodos para crear y gestionar citas
  createAppointment(request: AppointmentRequest): Observable<BookingConfirmation> {
    return this.appointmentTypes$.pipe(
      map(types => {
        const appointmentType = types.find(t => t.id === request.appointmentTypeId);
        if (!appointmentType) {
          throw new Error('Tipo de cita no encontrado');
        }

        const newAppointment: Appointment = {
          id: this.generateId(),
          title: `${appointmentType.name} - ${request.clientInfo.name}`,
          description: request.notes,
          startDate: request.startDate,
          endDate: new Date(request.startDate.getTime() + (appointmentType.duration * 60000)),
          status: appointmentType.requiresApproval ? AppointmentStatus.PENDING : AppointmentStatus.CONFIRMED,
          type: appointmentType,
          clientInfo: request.clientInfo,
          notes: request.notes,
          price: appointmentType.price,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Agregar la nueva cita
        const currentAppointments = this.appointmentsSubject.value;
        this.appointmentsSubject.next([...currentAppointments, newAppointment]);

        const confirmation: BookingConfirmation = {
          appointment: newAppointment,
          confirmationCode: this.generateConfirmationCode(),
          rescheduleUrl: `/agendar/reschedule/${newAppointment.id}`,
          cancelUrl: `/agendar/cancel/${newAppointment.id}`,
          meetingDetails: 'Los detalles de la reunión se enviarán por email'
        };

        return confirmation;
      }),
      delay(1000) // Simular llamada a API
    );
  }

  updateAppointmentStatus(id: string, status: AppointmentStatus): Observable<boolean> {
    const appointments = this.appointmentsSubject.value;
    const appointmentIndex = appointments.findIndex(a => a.id === id);
    
    if (appointmentIndex === -1) {
      return of(false);
    }

    appointments[appointmentIndex] = {
      ...appointments[appointmentIndex],
      status,
      updatedAt: new Date()
    };

    this.appointmentsSubject.next([...appointments]);
    return of(true).pipe(delay(500));
  }

  cancelAppointment(id: string, reason?: string): Observable<boolean> {
    return this.updateAppointmentStatus(id, AppointmentStatus.CANCELLED);
  }

  rescheduleAppointment(id: string, newStartDate: Date): Observable<boolean> {
    const appointments = this.appointmentsSubject.value;
    const appointmentIndex = appointments.findIndex(a => a.id === id);
    
    if (appointmentIndex === -1) {
      return of(false);
    }

    const appointment = appointments[appointmentIndex];
    const duration = appointment.type.duration * 60000;

    appointments[appointmentIndex] = {
      ...appointment,
      startDate: newStartDate,
      endDate: new Date(newStartDate.getTime() + duration),
      status: AppointmentStatus.CONFIRMED,
      updatedAt: new Date()
    };

    this.appointmentsSubject.next([...appointments]);
    return of(true).pipe(delay(500));
  }

  // Métodos auxiliares
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateConfirmationCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  // Métodos para administración (mock)
  updateSettings(settings: Partial<CalendarSettings>): Observable<CalendarSettings> {
    const currentSettings = this.settingsSubject.value;
    if (!currentSettings) throw new Error('Settings not initialized');

    const updatedSettings = { ...currentSettings, ...settings };
    this.settingsSubject.next(updatedSettings);
    return of(updatedSettings).pipe(delay(500));
  }

  updateAppointmentType(appointmentType: AppointmentType): Observable<boolean> {
    const types = this.appointmentTypesSubject.value;
    const index = types.findIndex(t => t.id === appointmentType.id);
    
    if (index === -1) {
      types.push(appointmentType);
    } else {
      types[index] = appointmentType;
    }

    this.appointmentTypesSubject.next([...types]);
    return of(true).pipe(delay(500));
  }

  deleteAppointmentType(id: string): Observable<boolean> {
    const types = this.appointmentTypesSubject.value.filter(t => t.id !== id);
    this.appointmentTypesSubject.next(types);
    return of(true).pipe(delay(500));
  }
}