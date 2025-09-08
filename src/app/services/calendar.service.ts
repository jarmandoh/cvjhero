import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { 
  CalendlyEvent, 
  CalendlyBooking, 
  CalendlySettings, 
  MeetingType, 
  CalendlyWidgetConfig,
  PreMeetingInfo 
} from '../models/calendar.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private readonly BOOKINGS_KEY = 'cvjhero_calendar_bookings';
  private readonly SETTINGS_KEY = 'cvjhero_calendar_settings';

  private bookingsSubject = new BehaviorSubject<CalendlyBooking[]>([]);
  private settingsSubject = new BehaviorSubject<CalendlySettings | null>(null);
  
  public bookings$ = this.bookingsSubject.asObservable();
  public settings$ = this.settingsSubject.asObservable();

  // Configuración por defecto de Calendly
  private defaultSettings: CalendlySettings = {
    username: 'janierhernandez', // Cambiar por tu username real
    hideEventDetails: false,
    hideLandingPageDetails: true,
    primaryColor: '#3b82f6',
    textColor: '#374151',
    backgroundColor: '#ffffff',
    timezone: 'America/Bogota',
    embed: {
      height: 630,
      minWidth: 320
    }
  };

  // Tipos de reunión disponibles
  meetingTypes: MeetingType[] = [
    {
      id: 'consulta-gratuita',
      title: 'Consulta Gratuita',
      description: 'Conversación inicial para conocer tu proyecto y necesidades. Sin compromiso.',
      duration: '30 minutos',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      color: 'blue',
      calendlyUrl: 'https://calendly.com/janierhernandez/consulta-gratuita',
      features: [
        'Análisis inicial del proyecto',
        'Identificación de necesidades',
        'Propuesta de solución',
        'Estimación de tiempo y costos'
      ],
      recommended: true
    },
    {
      id: 'consultoria-tecnica',
      title: 'Consultoría Técnica',
      description: 'Sesión especializada para resolver dudas técnicas específicas.',
      duration: '60 minutos',
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      color: 'green',
      calendlyUrl: 'https://calendly.com/janierhernandez/consultoria-tecnica',
      features: [
        'Análisis técnico profundo',
        'Recomendaciones de arquitectura',
        'Revisión de código',
        'Mejores prácticas'
      ],
      price: 'Desde $100 USD'
    },
    {
      id: 'presentacion-proyecto',
      title: 'Presentación de Proyecto',
      description: 'Reunión para presentar propuesta detallada de tu proyecto.',
      duration: '45 minutos',
      icon: 'M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h4a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 3v1h2V3H9zm-5 3v8h12V6H4z',
      color: 'purple',
      calendlyUrl: 'https://calendly.com/janierhernandez/presentacion-proyecto',
      features: [
        'Propuesta detallada',
        'Cronograma del proyecto',
        'Costos y metodología',
        'Q&A sobre el proyecto'
      ]
    },
    {
      id: 'seguimiento-proyecto',
      title: 'Seguimiento de Proyecto',
      description: 'Reunión de seguimiento para proyectos en curso.',
      duration: '30 minutos',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      color: 'indigo',
      calendlyUrl: 'https://calendly.com/janierhernandez/seguimiento-proyecto',
      features: [
        'Revisión de avances',
        'Resolución de dudas',
        'Ajustes de cronograma',
        'Próximos pasos'
      ]
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadData();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private loadData(): void {
    if (!this.isBrowser()) {
      this.settingsSubject.next(this.defaultSettings);
      return;
    }

    try {
      const bookings = JSON.parse(localStorage.getItem(this.BOOKINGS_KEY) || '[]');
      const settings = JSON.parse(localStorage.getItem(this.SETTINGS_KEY) || 'null') || this.defaultSettings;

      this.bookingsSubject.next(bookings);
      this.settingsSubject.next(settings);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      this.settingsSubject.next(this.defaultSettings);
    }
  }

  private saveData(): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(this.bookingsSubject.value));
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settingsSubject.value));
    } catch (error) {
      console.error('Error saving calendar data:', error);
    }
  }

  // Obtener tipos de reunión
  getMeetingTypes(): MeetingType[] {
    return this.meetingTypes;
  }

  getMeetingTypeById(id: string): MeetingType | undefined {
    return this.meetingTypes.find(type => type.id === id);
  }

  // Gestión de configuración
  getSettings(): Observable<CalendlySettings | null> {
    return this.settings$;
  }

  updateSettings(settings: Partial<CalendlySettings>): Observable<CalendlySettings> {
    const currentSettings = this.settingsSubject.value || this.defaultSettings;
    const updatedSettings = { ...currentSettings, ...settings };
    
    this.settingsSubject.next(updatedSettings);
    this.saveData();
    
    return of(updatedSettings).pipe(delay(300));
  }

  // Gestión de citas
  getAllBookings(): Observable<CalendlyBooking[]> {
    return this.bookings$;
  }

  getUpcomingBookings(): Observable<CalendlyBooking[]> {
    return new Observable(observer => {
      this.bookings$.subscribe(bookings => {
        const upcoming = bookings.filter(booking => 
          booking.status === 'scheduled' && 
          new Date(booking.scheduledTime) > new Date()
        ).sort((a, b) => 
          new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
        );
        observer.next(upcoming);
      });
    });
  }

  createBooking(booking: Omit<CalendlyBooking, 'id' | 'createdAt' | 'updatedAt'>): Observable<CalendlyBooking> {
    const newBooking: CalendlyBooking = {
      ...booking,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentBookings = this.bookingsSubject.value;
    this.bookingsSubject.next([...currentBookings, newBooking]);
    this.saveData();

    return of(newBooking).pipe(delay(500));
  }

  updateBooking(id: string, updates: Partial<CalendlyBooking>): Observable<CalendlyBooking | null> {
    const currentBookings = this.bookingsSubject.value;
    const bookingIndex = currentBookings.findIndex(booking => booking.id === id);

    if (bookingIndex === -1) {
      return of(null);
    }

    const updatedBooking = {
      ...currentBookings[bookingIndex],
      ...updates,
      updatedAt: new Date()
    };

    currentBookings[bookingIndex] = updatedBooking;
    this.bookingsSubject.next(currentBookings);
    this.saveData();

    return of(updatedBooking).pipe(delay(300));
  }

  cancelBooking(id: string): Observable<boolean> {
    return this.updateBooking(id, { status: 'cancelled' }).pipe(
      delay(300),
      map((booking: CalendlyBooking | null) => booking !== null)
    );
  }

  // Utilidades para integración con Calendly
  generateCalendlyUrl(meetingType: string, prefill?: Record<string, string>): string {
    const baseUrl = this.meetingTypes.find(type => type.id === meetingType)?.calendlyUrl;
    if (!baseUrl) return '';

    if (!prefill) return baseUrl;

    const params = new URLSearchParams();
    Object.entries(prefill).forEach(([key, value]) => {
      params.append(key, value);
    });

    return `${baseUrl}?${params.toString()}`;
  }

  // Enviar información previa al agendamiento
  submitPreMeetingInfo(info: PreMeetingInfo): Observable<boolean> {
    // En un caso real, esto enviaría la información a tu backend
    console.log('Pre-meeting info submitted:', info);
    
    // Simular envío exitoso
    return of(true).pipe(delay(1000));
  }

  // Cargar script de Calendly
  loadCalendlyScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isBrowser()) {
        resolve();
        return;
      }

      // Verificar si ya está cargado
      if ((window as any).Calendly) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Calendly script'));
      
      document.head.appendChild(script);
    });
  }

  // Inicializar widget de Calendly
  initCalendlyWidget(config: CalendlyWidgetConfig): Promise<void> {
    return this.loadCalendlyScript().then(() => {
      if (!this.isBrowser() || !(window as any).Calendly) {
        throw new Error('Calendly not available');
      }

      (window as any).Calendly.initInlineWidget({
        url: config.url,
        parentElement: config.parentElement,
        prefill: config.prefill || {},
        utm: config.utm || {}
      });
    });
  }

  // Abrir popup de Calendly
  openCalendlyPopup(url: string, prefill?: Record<string, string>): Promise<void> {
    return this.loadCalendlyScript().then(() => {
      if (!this.isBrowser() || !(window as any).Calendly) {
        throw new Error('Calendly not available');
      }

      (window as any).Calendly.initPopupWidget({
        url: url,
        prefill: prefill || {}
      });
    });
  }
}
