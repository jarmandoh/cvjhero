import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalendarService } from '../../services/calendar.service';
import { MeetingType, PreMeetingInfo } from '../../models/calendar.model';

@Component({
  selector: 'app-calendly-widget',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './calendly-widget.component.html',
  styleUrls: ['./calendly-widget.component.css']
})
export class CalendlyWidgetComponent implements OnInit, OnDestroy {
  @Input() meetingType: string = 'consulta-gratuita';
  @Input() showPreForm: boolean = true;
  @Input() inline: boolean = true;
  @Output() bookingCompleted = new EventEmitter<any>();
  @Output() widgetClosed = new EventEmitter<void>();

  @ViewChild('calendlyContainer', { static: false }) calendlyContainer!: ElementRef;

  preFormGroup: FormGroup;
  showCalendlyWidget = false;
  isLoading = false;
  selectedMeetingType: MeetingType | null = null;

  projectTypes = [
    'Desarrollo Web',
    'Aplicación Móvil',
    'E-commerce',
    'Consultoría Técnica',
    'Migración de Sistema',
    'Mantenimiento',
    'Otro'
  ];

  budgetRanges = [
    'Menos de $1,000',
    '$1,000 - $5,000',
    '$5,000 - $10,000',
    '$10,000 - $25,000',
    'Más de $25,000',
    'Por definir'
  ];

  timelines = [
    'Inmediato (1-2 semanas)',
    'Corto plazo (1 mes)',
    'Mediano plazo (2-3 meses)',
    'Largo plazo (3+ meses)',
    'Flexible'
  ];

  constructor(
    private fb: FormBuilder,
    private calendarService: CalendarService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.preFormGroup = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      company: [''],
      phone: [''],
      projectType: ['', Validators.required],
      budget: ['', Validators.required],
      timeline: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
      preferredTime: ['']
    });
  }

  ngOnInit(): void {
    this.loadMeetingType();
    
    if (!this.showPreForm) {
      this.initCalendlyWidget();
    }
  }

  ngOnDestroy(): void {
    this.cleanupCalendlyWidget();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private loadMeetingType(): void {
    this.selectedMeetingType = this.calendarService.getMeetingTypeById(this.meetingType) || null;
  }

  get f() {
    return this.preFormGroup.controls;
  }

  onSubmitPreForm(): void {
    if (this.preFormGroup.valid) {
      this.isLoading = true;
      
      const preInfo: PreMeetingInfo = this.preFormGroup.value;
      
      this.calendarService.submitPreMeetingInfo(preInfo).subscribe({
        next: (success) => {
          if (success) {
            this.showCalendlyWidget = true;
            setTimeout(() => {
              this.initCalendlyWidget();
            }, 100);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error submitting pre-meeting info:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.preFormGroup.controls).forEach(key => {
      this.preFormGroup.get(key)?.markAsTouched();
    });
  }

  private initCalendlyWidget(): void {
    if (!this.isBrowser() || !this.selectedMeetingType) return;

    const container = this.calendlyContainer?.nativeElement;
    if (!container) return;

    // Prefill data from form if available
    const prefill: Record<string, string> = {};
    if (this.preFormGroup.value.name) {
      const nameParts = this.preFormGroup.value.name.split(' ');
      prefill['name'] = this.preFormGroup.value.name;
      if (nameParts.length > 1) {
        prefill['firstName'] = nameParts[0];
        prefill['lastName'] = nameParts.slice(1).join(' ');
      }
    }
    if (this.preFormGroup.value.email) {
      prefill['email'] = this.preFormGroup.value.email;
    }

    // Custom answers for additional info
    const customAnswers: Record<string, string> = {};
    if (this.preFormGroup.value.company) {
      customAnswers['a1'] = this.preFormGroup.value.company;
    }
    if (this.preFormGroup.value.projectType) {
      customAnswers['a2'] = this.preFormGroup.value.projectType;
    }
    if (this.preFormGroup.value.budget) {
      customAnswers['a3'] = this.preFormGroup.value.budget;
    }

    this.calendarService.initCalendlyWidget({
      url: this.selectedMeetingType.calendlyUrl,
      parentElement: container,
      prefill: {
        ...prefill,
        customAnswers
      }
    }).catch(error => {
      console.error('Error initializing Calendly widget:', error);
    });

    // Listen for Calendly events
    this.setupCalendlyEventListeners();
  }

  private setupCalendlyEventListeners(): void {
    if (!this.isBrowser()) return;

    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== 'https://calendly.com') return;

      if (e.data.event && e.data.event.indexOf('calendly') === 0) {
        switch (e.data.event) {
          case 'calendly.event_scheduled':
            this.bookingCompleted.emit(e.data.payload);
            break;
          case 'calendly.event_type_viewed':
            console.log('Event type viewed:', e.data.payload);
            break;
          case 'calendly.date_and_time_selected':
            console.log('Date and time selected:', e.data.payload);
            break;
          case 'calendly.profile_page_viewed':
            console.log('Profile page viewed');
            break;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Store cleanup function
    (this as any)._calendlyCleanup = () => {
      window.removeEventListener('message', handleMessage);
    };
  }

  private cleanupCalendlyWidget(): void {
    if ((this as any)._calendlyCleanup) {
      (this as any)._calendlyCleanup();
    }
  }

  skipPreForm(): void {
    this.showCalendlyWidget = true;
    setTimeout(() => {
      this.initCalendlyWidget();
    }, 100);
  }

  goBackToForm(): void {
    this.showCalendlyWidget = false;
    this.cleanupCalendlyWidget();
  }

  getFieldError(fieldName: string): string {
    const field = this.preFormGroup.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${requiredLength} caracteres`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      name: 'Nombre',
      email: 'Email',
      company: 'Empresa',
      phone: 'Teléfono',
      projectType: 'Tipo de proyecto',
      budget: 'Presupuesto',
      timeline: 'Cronograma',
      message: 'Mensaje',
      preferredTime: 'Horario preferido'
    };
    return labels[fieldName] || fieldName;
  }

  close(): void {
    this.widgetClosed.emit();
  }
}
