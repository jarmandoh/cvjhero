import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsletterService } from '../../services/newsletter.service';
import { NewsletterPreferences, SubscriptionSource } from '../../models/subscriber.model';

@Component({
  selector: 'app-newsletter-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './newsletter-signup.component.html',
  styleUrl: './newsletter-signup.component.css'
})
export class NewsletterSignupComponent {
  @Input() variant: 'inline' | 'modal' | 'sidebar' | 'compact' | 'minimal' = 'inline';
  @Input() source: SubscriptionSource = 'website';
  @Input() showPreferences = false;
  @Output() subscriptionSuccess = new EventEmitter<void>();
  @Output() subscriptionError = new EventEmitter<string>();

  subscriptionForm: FormGroup;
  isLoading = false;
  isSuccess = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private newsletterService: NewsletterService
  ) {
    this.subscriptionForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: [''],
      frequency: ['monthly'],
      topics: [['desarrollo-web']],
      language: ['es']
    });
  }

  onSubmit() {
    if (this.subscriptionForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData = this.subscriptionForm.value;
      const preferences: Partial<NewsletterPreferences> | undefined = this.showPreferences ? {
        frequency: formData.frequency,
        topics: formData.topics,
        language: formData.language
      } : undefined;

      this.newsletterService.subscribe(
        formData.email,
        formData.name || undefined,
        this.source,
        preferences
      ).subscribe({
        next: (success) => {
          this.isLoading = false;
          if (success) {
            this.isSuccess = true;
            this.subscriptionForm.reset();
            this.subscriptionSuccess.emit();
            
            // Auto-hide success message after 3 seconds
            setTimeout(() => {
              this.isSuccess = false;
            }, 3000);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error;
          this.subscriptionError.emit(error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.subscriptionForm.controls).forEach(key => {
      const control = this.subscriptionForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.subscriptionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.subscriptionForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} es requerido`;
      }
      if (field.errors['email']) {
        return 'Por favor ingresa un email válido';
      }
    }
    return '';
  }

  toggleTopic(topic: string) {
    const topics = this.subscriptionForm.get('topics')?.value || [];
    const index = topics.indexOf(topic);
    
    if (index > -1) {
      topics.splice(index, 1);
    } else {
      topics.push(topic);
    }
    
    this.subscriptionForm.patchValue({ topics });
  }

  isTopicSelected(topic: string): boolean {
    const topics = this.subscriptionForm.get('topics')?.value || [];
    return topics.includes(topic);
  }

  resetForm() {
    this.subscriptionForm.reset({
      frequency: 'monthly',
      topics: ['desarrollo-web'],
      language: 'es'
    });
    this.isSuccess = false;
    this.errorMessage = '';
  }
}
