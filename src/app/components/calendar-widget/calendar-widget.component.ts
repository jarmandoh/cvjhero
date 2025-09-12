import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventApi, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Subject, takeUntil } from 'rxjs';

import { AppointmentService } from '../../services/appointment.service';
import { Appointment, AppointmentType, TimeSlot } from '../../models/appointment.model';

@Component({
  selector: 'app-calendar-widget',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar-widget.component.html',
  styleUrls: ['./calendar-widget.component.css']
})
export class CalendarWidgetComponent implements OnInit, OnDestroy {
  @Input() viewMode: 'booking' | 'admin' = 'booking';
  @Input() selectedAppointmentType: AppointmentType | null = null;
  @Output() slotSelected = new EventEmitter<TimeSlot>();
  @Output() appointmentClicked = new EventEmitter<Appointment>();

  private destroy$ = new Subject<void>();
  
  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    locale: 'es',
    firstDay: 1, // Lunes
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00:00',
    allDaySlot: false,
    height: 'auto',
    expandRows: true,
    nowIndicator: true,
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5], // Lunes a Viernes
      startTime: '09:00',
      endTime: '18:00'
    },
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: false,
    editable: this.viewMode === 'admin',
    eventDisplay: 'block',
    eventColor: '#3B82F6',
    eventTextColor: '#FFFFFF',
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    eventDidMount: this.handleEventMount.bind(this),
    selectConstraint: 'businessHours',
    selectOverlap: false,
    eventOverlap: false,
    selectAllow: this.selectAllow.bind(this)
  };

  currentEvents: EventApi[] = [];
  appointments: Appointment[] = [];
  appointmentTypes: AppointmentType[] = [];
  availableSlots: TimeSlot[] = [];
  isLoading = false;

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.loadAppointmentTypes();
    this.updateCalendarView();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAppointments(): void {
    this.appointmentService.getAppointments()
      .pipe(takeUntil(this.destroy$))
      .subscribe(appointments => {
        this.appointments = appointments;
        this.updateCalendarEvents();
      });
  }

  private loadAppointmentTypes(): void {
    this.appointmentService.getAppointmentTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(types => {
        this.appointmentTypes = types;
      });
  }

  private updateCalendarView(): void {
    if (this.viewMode === 'booking') {
      this.calendarOptions = {
        ...this.calendarOptions,
        initialView: 'timeGridWeek',
        editable: false,
        selectable: true,
        headerToolbar: {
          left: 'prev,next',
          center: 'title',
          right: 'timeGridWeek,timeGridDay'
        }
      };
    } else {
      this.calendarOptions = {
        ...this.calendarOptions,
        initialView: 'dayGridMonth',
        editable: true,
        selectable: true,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }
      };
    }
  }

  private updateCalendarEvents(): void {
    const events = this.appointments.map(appointment => ({
      id: appointment.id,
      title: appointment.title,
      start: appointment.startDate.toISOString(),
      end: appointment.endDate.toISOString(),
      backgroundColor: appointment.type.color,
      borderColor: appointment.type.color,
      textColor: '#FFFFFF',
      extendedProps: {
        appointment: appointment,
        status: appointment.status,
        clientEmail: appointment.clientInfo.email,
        clientPhone: appointment.clientInfo.phone,
        price: appointment.price
      },
      classNames: [
        'appointment-event',
        `status-${appointment.status}`,
        this.viewMode === 'booking' ? 'booking-view' : 'admin-view'
      ]
    }));

    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };
  }

  private handleDateSelect(selectInfo: DateSelectArg): void {
    if (this.viewMode === 'booking' && this.selectedAppointmentType) {
      this.handleBookingSelection(selectInfo);
    } else if (this.viewMode === 'admin') {
      this.handleAdminSelection(selectInfo);
    }
  }

  private handleBookingSelection(selectInfo: DateSelectArg): void {
    const selectedDate = selectInfo.start;
    const appointmentTypeId = this.selectedAppointmentType?.id;

    if (!appointmentTypeId) {
      alert('Por favor selecciona un tipo de cita primero');
      return;
    }

    this.isLoading = true;
    
    this.appointmentService.getAvailableSlots(selectedDate, appointmentTypeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (slots) => {
          this.isLoading = false;
          const availableSlot = slots.find(slot => 
            slot.startTime.getTime() === selectedDate.getTime() && slot.isAvailable
          );

          if (availableSlot) {
            this.slotSelected.emit(availableSlot);
          } else {
            alert('Este horario no está disponible. Por favor selecciona otro.');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al cargar slots disponibles:', error);
          alert('Error al verificar disponibilidad. Intenta de nuevo.');
        }
      });

    // Limpiar la selección
    selectInfo.view.calendar.unselect();
  }

  private handleAdminSelection(selectInfo: DateSelectArg): void {
    // En modo admin, permitir crear nuevas citas
    const title = prompt('Ingresa el título de la cita:');
    if (title) {
      // TODO: Implementar creación rápida de cita desde el calendario admin
      console.log('Crear cita:', {
        title,
        start: selectInfo.start,
        end: selectInfo.end
      });
    }
    selectInfo.view.calendar.unselect();
  }

  private handleEventClick(clickInfo: EventClickArg): void {
    const appointment = clickInfo.event.extendedProps['appointment'] as Appointment;
    
    if (this.viewMode === 'admin') {
      // En modo admin, mostrar opciones de gestión
      this.showAdminEventOptions(clickInfo, appointment);
    } else {
      // En modo booking, solo mostrar información
      this.appointmentClicked.emit(appointment);
    }
  }

  private showAdminEventOptions(clickInfo: EventClickArg, appointment: Appointment): void {
    const action = prompt(
      `Cita: ${appointment.title}\n` +
      `Cliente: ${appointment.clientInfo.name}\n` +
      `Estado: ${appointment.status}\n\n` +
      `Acciones disponibles:\n` +
      `1. Ver detalles\n` +
      `2. Confirmar\n` +
      `3. Cancelar\n` +
      `4. Eliminar\n\n` +
      `Ingresa el número de la acción:`
    );

    switch (action) {
      case '1':
        this.appointmentClicked.emit(appointment);
        break;
      case '2':
        this.confirmAppointment(appointment.id);
        break;
      case '3':
        this.cancelAppointment(appointment.id);
        break;
      case '4':
        if (confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
          this.deleteAppointment(appointment.id, clickInfo);
        }
        break;
    }
  }

  private confirmAppointment(id: string): void {
    this.appointmentService.updateAppointmentStatus(id, 'confirmed' as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
          if (success) {
            alert('Cita confirmada exitosamente');
          }
        },
        error: (error) => {
          console.error('Error al confirmar cita:', error);
          alert('Error al confirmar la cita');
        }
      });
  }

  private cancelAppointment(id: string): void {
    const reason = prompt('Razón de la cancelación (opcional):');
    this.appointmentService.cancelAppointment(id, reason || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
          if (success) {
            alert('Cita cancelada exitosamente');
          }
        },
        error: (error) => {
          console.error('Error al cancelar cita:', error);
          alert('Error al cancelar la cita');
        }
      });
  }

  private deleteAppointment(id: string, clickInfo: EventClickArg): void {
    // Eliminar visualmente del calendario
    clickInfo.event.remove();
    
    // En implementación real, llamar al servicio para eliminar
    console.log('Eliminando cita:', id);
  }

  private handleEvents(events: EventApi[]): void {
    this.currentEvents = events;
  }

  private handleEventMount(info: any): void {
    const appointment = info.event.extendedProps.appointment as Appointment;
    
    // Agregar tooltip con información adicional
    info.el.title = `${appointment.title}\n` +
      `Cliente: ${appointment.clientInfo.name}\n` +
      `Email: ${appointment.clientInfo.email}\n` +
      `Estado: ${appointment.status}\n` +
      `Duración: ${appointment.type.duration} min`;

    // Agregar clases CSS basadas en el estado
    info.el.classList.add(`appointment-${appointment.status}`);
    
    if (appointment.price && appointment.price > 0) {
      info.el.classList.add('paid-appointment');
    }
  }

  private selectAllow(selectInfo: any): boolean {
    // Permitir selección solo en horarios de trabajo y fechas futuras
    const now = new Date();
    const selectedDate = selectInfo.start;

    // No permitir seleccionar fechas pasadas
    if (selectedDate < now) {
      return false;
    }

    // En modo booking, verificar disponibilidad
    if (this.viewMode === 'booking') {
      return this.isTimeSlotAllowed(selectedDate);
    }

    return true;
  }

  private isTimeSlotAllowed(date: Date): boolean {
    const dayOfWeek = date.getDay();
    const hour = date.getHours();

    // Horarios de trabajo básicos (lunes a viernes, 9-18)
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      return false;
    }

    if (hour < 9 || hour >= 18) { // Fuera de horario laboral
      return false;
    }

    return true;
  }

  // Métodos públicos para controlar el calendario
  public goToDate(date: Date): void {
    // Implementar navegación a fecha específica
  }

  public changeView(viewName: string): void {
    this.calendarOptions = {
      ...this.calendarOptions,
      initialView: viewName as any
    };
  }

  public refreshEvents(): void {
    this.loadAppointments();
  }

  public getSelectedSlots(): TimeSlot[] {
    return this.availableSlots;
  }

  public getConfirmedAppointments(): number {
    return this.appointments.filter(apt => apt.status === 'confirmed').length;
  }

  public getPendingAppointments(): number {
    return this.appointments.filter(apt => apt.status === 'pending').length;
  }
}