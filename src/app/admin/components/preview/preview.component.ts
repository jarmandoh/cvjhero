import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-preview',
  imports: [CommonModule],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.css'
})
export class PreviewComponent {
  @Input() content: string = '';
  @Input() title: string = 'Vista Previa';

  constructor(private sanitizer: DomSanitizer) {}

  get sanitizedContent(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.content);
  }

  getWordCount(): number {
    if (!this.content) return 0;
    const text = this.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }

  getCharacterCount(): number {
    if (!this.content) return 0;
    const text = this.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return text.length;
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}
