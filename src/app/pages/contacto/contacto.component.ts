import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { EmailService } from '../../services/email.service';
import { ContactFormData, EmailResponse } from '../../models/email.model';
import { NewsletterSignupComponent } from '../../components/newsletter-signup/newsletter-signup.component';
import { CustomValidators } from '../../validators/custom-validators';

@Component({
  selector: 'app-contacto',
  imports: [CommonModule, ReactiveFormsModule, NewsletterSignupComponent],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent implements OnInit, OnDestroy {
  contactForm: FormGroup;
  isSubmitting = false;
  submitMessage = '';
  submitStatus: 'success' | 'error' | '' = '';
  
  // Estados de validación en tiempo real
  validationStatus: { [key: string]: 'validating' | 'valid' | 'invalid' | 'pristine' } = {};
  
  // Sugerencias para autocompletado
  companySuggestions: string[] = [];
  showCompanySuggestions = false;
  
  private destroy$ = new Subject<void>();

  // Opciones para servicios
  serviceOptions = [
    { value: '', label: 'Selecciona un servicio' },
    { value: 'web-development', label: 'Desarrollo Web' },
    { value: 'mobile-app', label: 'Aplicaciones Móviles' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'consulting', label: 'Consultoría Técnica' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'other', label: 'Otro' }
  ];

  // Sugerencias predefinidas para empresas
  predefinedCompanies = [
    'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Spotify',
    'Startup Tech', 'Innovación Digital', 'Soluciones Web', 'TechCorp',
    'Digital Solutions', 'WebDev Inc', 'Mobile First', 'CloudTech',
    'DataCorp', 'AI Solutions', 'BlockchainTech', 'CyberSecurity Pro'
  ];

  constructor(
    private fb: FormBuilder,
    private emailService: EmailService
  ) {
    this.contactForm = this.createForm();
  }

  ngOnInit(): void {
    // Configurar validaciones en tiempo real
    this.setupRealTimeValidation();
    // Inicializar estados de validación
    this.initializeValidationStates();
    // Configurar autocompletado
    this.setupAutoComplete();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50),
        CustomValidators.nameAdvanced
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        CustomValidators.emailAdvanced
      ]],
      phone: ['', [
        CustomValidators.phoneAdvanced
      ]],
      company: ['', [
        Validators.maxLength(100),
        CustomValidators.companyAdvanced
      ]],
      service: [''],
      subject: ['', [
        Validators.required, 
        Validators.minLength(5), 
        Validators.maxLength(100),
        CustomValidators.subjectQuality
      ]],
      message: ['', [
        Validators.required, 
        Validators.minLength(10), 
        Validators.maxLength(1000),
        CustomValidators.messageQuality,
        CustomValidators.spamDetection,
        CustomValidators.serviceMessageMatch()
      ]]
    });
  }

  private setupRealTimeValidation(): void {
    // Configurar validación en tiempo real para cada campo
    Object.keys(this.contactForm.controls).forEach(fieldName => {
      const control = this.contactForm.get(fieldName);
      if (control) {
        // Inicializar estado
        this.validationStatus[fieldName] = 'pristine';
        
        // Validación con debounce para mejor UX
        control.valueChanges
          .pipe(
            takeUntil(this.destroy$),
            debounceTime(300),
            distinctUntilChanged()
          )
          .subscribe(() => {
            this.validateField(fieldName);
          });

        // Validación inmediata en blur
        control.statusChanges
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            if (control.touched) {
              this.validateField(fieldName);
            }
          });
      }
    });

    // Validación especial para email con sugerencias
    this.contactForm.get('email')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500)
      )
      .subscribe(email => {
        if (email && email.includes('@') && !email.includes('.')) {
          // Sugerir dominios comunes
          this.suggestEmailDomain(email);
        }
      });
  }

  private initializeValidationStates(): void {
    Object.keys(this.contactForm.controls).forEach(fieldName => {
      this.validationStatus[fieldName] = 'pristine';
    });
  }

  private setupAutoComplete(): void {
    // Autocompletado para empresa
    this.contactForm.get('company')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe(value => {
        if (value && value.length >= 2) {
          this.updateCompanySuggestions(value);
        } else {
          this.showCompanySuggestions = false;
        }
      });
  }

  private validateField(fieldName: string): void {
    const control = this.contactForm.get(fieldName);
    if (!control) return;

    if (control.pending) {
      this.validationStatus[fieldName] = 'validating';
    } else if (control.valid && control.touched) {
      this.validationStatus[fieldName] = 'valid';
    } else if (control.invalid && control.touched) {
      this.validationStatus[fieldName] = 'invalid';
    } else {
      this.validationStatus[fieldName] = 'pristine';
    }
  }

  private suggestEmailDomain(email: string): void {
    // Implementar sugerencias de dominio para email
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    // Esta funcionalidad se puede expandir más tarde
  }

  private updateCompanySuggestions(query: string): void {
    const filtered = this.predefinedCompanies.filter(company =>
      company.toLowerCase().includes(query.toLowerCase())
    );
    this.companySuggestions = filtered.slice(0, 5);
    this.showCompanySuggestions = filtered.length > 0;
  }

  onSubmit(): void {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.submitMessage = '';
      this.submitStatus = '';

      const formData: ContactFormData = {
        name: this.contactForm.value.name,
        email: this.contactForm.value.email,
        phone: this.contactForm.value.phone,
        company: this.contactForm.value.company,
        service: this.contactForm.value.service,
        subject: this.contactForm.value.subject,
        message: this.contactForm.value.message
      };

      this.emailService.sendEmail(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: EmailResponse) => {
            this.handleEmailResponse(response);
          },
          error: (error) => {
            this.handleEmailError(error);
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private handleEmailResponse(response: EmailResponse): void {
    if (response.success) {
      this.submitStatus = 'success';
      this.submitMessage = '¡Mensaje enviado exitosamente! Te responderé lo antes posible.';
      this.contactForm.reset();
      
      // Auto-hide message after 5 seconds
      setTimeout(() => {
        this.submitMessage = '';
        this.submitStatus = '';
      }, 5000);
    } else {
      this.submitStatus = 'error';
      this.submitMessage = response.error || 'Error al enviar el mensaje. Por favor, intenta nuevamente.';
    }
  }

  private handleEmailError(error: any): void {
    this.submitStatus = 'error';
    this.submitMessage = 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.';
    console.error('Email send error:', error);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      this.contactForm.get(key)?.markAsTouched();
    });
  }

  // Getters para validación en template
  get name() { return this.contactForm.get('name'); }
  get email() { return this.contactForm.get('email'); }
  get phone() { return this.contactForm.get('phone'); }
  get company() { return this.contactForm.get('company'); }
  get service() { return this.contactForm.get('service'); }
  get subject() { return this.contactForm.get('subject'); }
  get message() { return this.contactForm.get('message'); }

  // Utilidades para el template
  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors && field.touched) {
      // Errores básicos
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es obligatorio`;
      if (field.errors['email']) return 'Email no válido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) return 'Formato no válido';
      
      // Errores personalizados avanzados
      if (field.errors['emailFormat']) return 'Formato de email incorrecto';
      if (field.errors['emailDomain']) return 'Dominio de email no válido';
      if (field.errors['phoneFormat']) return 'Formato de teléfono no válido (ej: +1 234 567 8900)';
      if (field.errors['nameIncomplete']) return 'Por favor ingresa nombre y apellido';
      if (field.errors['nameInvalidChars']) return 'Solo letras y espacios permitidos';
      if (field.errors['messageTooShort']) return 'El mensaje debe tener al menos 5 palabras';
      if (field.errors['messageRepetitive']) return 'El mensaje parece repetitivo, sé más específico';
      if (field.errors['companyTooShort']) return 'Nombre de empresa demasiado corto';
      if (field.errors['companyInvalid']) return 'Nombre de empresa no válido';
      if (field.errors['subjectTooGeneric']) return 'El asunto es muy genérico, sé más específico';
      if (field.errors['serviceMessageMismatch']) return 'El mensaje no parece relacionado con el servicio seleccionado';
      if (field.errors['possibleSpam']) return 'El mensaje contiene contenido que parece spam';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nombre',
      email: 'Email',
      phone: 'Teléfono',
      company: 'Empresa',
      service: 'Servicio',
      subject: 'Asunto',
      message: 'Mensaje'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    return this.validationStatus[fieldName] === 'invalid';
  }

  isFieldValid(fieldName: string): boolean {
    return this.validationStatus[fieldName] === 'valid';
  }

  isFieldValidating(fieldName: string): boolean {
    return this.validationStatus[fieldName] === 'validating';
  }

  getCharacterCount(fieldName: string): number {
    return this.contactForm.get(fieldName)?.value?.length || 0;
  }

  getMaxLength(fieldName: string): number {
    const maxLengths: { [key: string]: number } = {
      name: 50,
      company: 100,
      subject: 100,
      message: 1000
    };
    return maxLengths[fieldName] || 0;
  }

  // Sugerencias para autocompletado
  selectCompanySuggestion(company: string): void {
    this.contactForm.patchValue({ company });
    this.showCompanySuggestions = false;
  }

  onCompanyFocus(): void {
    const value = this.contactForm.get('company')?.value;
    if (value && value.length >= 2) {
      this.updateCompanySuggestions(value);
    }
  }

  onCompanyBlur(): void {
    // Delay para permitir click en sugerencias
    setTimeout(() => {
      this.showCompanySuggestions = false;
    }, 200);
  }

  // Método para obtener el tipo de indicador visual
  getFieldIndicatorType(fieldName: string): 'success' | 'error' | 'warning' | 'loading' | null {
    const status = this.validationStatus[fieldName];
    const field = this.contactForm.get(fieldName);
    
    if (status === 'validating') return 'loading';
    if (status === 'valid') return 'success';
    if (status === 'invalid') return 'error';
    
    // Casos especiales para warnings
    if (field?.touched && !field?.dirty && field?.value) return 'warning';
    
    return null;
  }

  // Sugerencias inteligentes basadas en el servicio seleccionado
  getServiceSuggestion(): string {
    const service = this.contactForm.get('service')?.value;
    const message = this.contactForm.get('message')?.value || '';
    
    if (!service || message.length > 50) return '';
    
    const suggestions: { [key: string]: string } = {
      'web-development': 'Ejemplo: "Necesito una página web corporativa con sistema de login, catálogo de productos y blog integrado. Presupuesto: $X, Tiempo: X meses"',
      'mobile-app': 'Ejemplo: "Requiero una app móvil para iOS/Android con funciones de geolocalización, notificaciones push y sincronización con API. Presupuesto: $X"',
      'ecommerce': 'Ejemplo: "Busco crear una tienda online con carrito de compras, pasarela de pagos, gestión de inventario y panel administrativo. Presupuesto: $X"',
      'consulting': 'Ejemplo: "Necesito consultoría técnica para optimizar mi sitio web actual, mejorar performance y implementar mejores prácticas de SEO"',
      'maintenance': 'Ejemplo: "Requiero mantenimiento mensual para mi sitio web: actualizaciones de seguridad, backups, optimización y soporte técnico"'
    };
    
    return suggestions[service] || '';
  }

  // Método para sugerir mejoras en el mensaje
  getMessageImprovement(): string {
    const message = this.contactForm.get('message')?.value || '';
    const service = this.contactForm.get('service')?.value;
    
    if (!message || message.length < 20) return '';
    
    const hasPresupuesto = /presupuesto|budget|precio|cost/i.test(message);
    const hasTiempo = /tiempo|deadline|fecha|urgente|cronograma/i.test(message);
    const hasTecnologia = /react|angular|vue|javascript|php|python|wordpress/i.test(message);
    
    const missing = [];
    if (!hasPresupuesto) missing.push('presupuesto estimado');
    if (!hasTiempo) missing.push('cronograma');
    if (!hasTecnologia && service !== 'consulting') missing.push('tecnologías preferidas');
    
    if (missing.length > 0) {
      return `Considera agregar: ${missing.join(', ')}`;
    }
    
    return '';
  }
}
