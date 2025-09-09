import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { EmailService } from '../../services/email.service';
import { ContactFormData, EmailResponse } from '../../models/email.model';
import { NewsletterSignupComponent } from '../../components/newsletter-signup/newsletter-signup.component';

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

  constructor(
    private fb: FormBuilder,
    private emailService: EmailService
  ) {
    this.contactForm = this.createForm();
  }

  ngOnInit(): void {
    // Configurar validaciones en tiempo real
    this.setupRealTimeValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\+]?[0-9\s\-\(\)]{10,}$/)]],
      company: ['', [Validators.maxLength(100)]],
      service: [''],
      subject: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  private setupRealTimeValidation(): void {
    // Validación de email en tiempo real
    this.contactForm.get('email')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(email => {
        if (email && !this.emailService.validateEmail(email)) {
          this.contactForm.get('email')?.setErrors({ invalidEmail: true });
        }
      });
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
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es obligatorio`;
      if (field.errors['email']) return 'Email no válido';
      if (field.errors['invalidEmail']) return 'Formato de email incorrecto';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) return 'Formato no válido';
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
    const field = this.contactForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field?.valid && field.touched);
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
}
