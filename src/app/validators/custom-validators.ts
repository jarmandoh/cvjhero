import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  // Validador de email más estricto
  static emailAdvanced(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    
    const email = control.value.toLowerCase();
    
    if (!emailRegex.test(email)) {
      return { emailFormat: true };
    }

    // Validar dominio común
    const domain = email.split('@')[1];
    if (!commonDomains.includes(domain) && !domain.includes('.')) {
      return { emailDomain: true };
    }

    return null;
  }

  // Validador de teléfono mejorado
  static phoneAdvanced(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const phone = control.value.replace(/\s/g, '');
    
    // Patrones para diferentes formatos internacionales
    const patterns = [
      /^\+\d{1,4}\d{6,14}$/, // Internacional con +
      /^\d{10}$/, // Nacional 10 dígitos
      /^\(\d{3}\)\s?\d{3}-\d{4}$/, // (123) 456-7890
      /^\d{3}-\d{3}-\d{4}$/, // 123-456-7890
    ];

    const isValid = patterns.some(pattern => pattern.test(phone));
    return isValid ? null : { phoneFormat: true };
  }

  // Validador de nombre más estricto
  static nameAdvanced(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const name = control.value.trim();
    
    // Debe contener al menos dos palabras (nombre y apellido)
    const words = name.split(' ').filter((word: string) => word.length > 0);
    if (words.length < 2) {
      return { nameIncomplete: true };
    }

    // Validar caracteres permitidos (letras, espacios, acentos)
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(name)) {
      return { nameInvalidChars: true };
    }

    return null;
  }

  // Validador de longitud de palabras en mensaje
  static messageQuality(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const message = control.value.trim();
    const words = message.split(' ').filter((word: string) => word.length > 0);
    
    // Debe tener al menos 5 palabras para ser considerado descriptivo
    if (words.length < 5) {
      return { messageTooShort: true };
    }

    // Verificar que no sea solo texto repetitivo
    const uniqueWords = new Set(words.map((word: string) => word.toLowerCase()));
    if (uniqueWords.size < words.length * 0.6) {
      return { messageRepetitive: true };
    }

    return null;
  }

  // Validador de empresa (opcional pero si se llena debe ser válido)
  static companyAdvanced(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value.trim() === '') {
      return null; // Es opcional
    }

    const company = control.value.trim();
    
    // Longitud mínima si se especifica
    if (company.length < 2) {
      return { companyTooShort: true };
    }

    // No debe ser solo números
    if (/^\d+$/.test(company)) {
      return { companyInvalid: true };
    }

    return null;
  }

  // Validador cross-field: el servicio debe coincidir con el mensaje
  static serviceMessageMatch(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }

      const service = control.parent.get('service')?.value;
      const message = control.parent.get('message')?.value;

      if (!service || !message) {
        return null;
      }

      // Keywords relacionadas con servicios
      const serviceKeywords: { [key: string]: string[] } = {
        'web-development': ['web', 'website', 'sitio', 'página', 'frontend', 'backend'],
        'mobile-app': ['app', 'móvil', 'android', 'ios', 'aplicación'],
        'ecommerce': ['tienda', 'venta', 'producto', 'carrito', 'pago', 'ecommerce'],
        'consulting': ['consulta', 'asesoría', 'consejo', 'auditoría'],
        'maintenance': ['mantenimiento', 'actualizar', 'corregir', 'mejorar']
      };

      const keywords = serviceKeywords[service] || [];
      const messageWords = message.toLowerCase().split(' ');
      
      const hasRelatedKeyword = keywords.some((keyword: string) => 
        messageWords.some((word: string) => word.includes(keyword))
      );

      return hasRelatedKeyword ? null : { serviceMessageMismatch: true };
    };
  }

  // Validador de asunto descriptivo
  static subjectQuality(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const subject = control.value.trim().toLowerCase();
    
    // Palabras demasiado genéricas
    const genericWords = ['hola', 'consulta', 'pregunta', 'info', 'información'];
    const isGeneric = genericWords.some(word => subject === word);
    
    if (isGeneric) {
      return { subjectTooGeneric: true };
    }

    return null;
  }

  // Validador de detección de spam
  static spamDetection(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const text = control.value.toLowerCase();
    
    // Palabras/frases comunes de spam
    const spamIndicators = [
      'ganar dinero', 'click aquí', 'oferta especial', 'gratis',
      'urgente', 'limitada', 'ganador', 'premio'
    ];

    const spamCount = spamIndicators.filter(indicator => 
      text.includes(indicator)
    ).length;

    if (spamCount >= 2) {
      return { possibleSpam: true };
    }

    return null;
  }
}