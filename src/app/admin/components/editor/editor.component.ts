import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-editor',
  imports: [CommonModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent implements OnInit {
  @Input() content: string = '';
  @Input() placeholder: string = 'Comienza a escribir...';
  @Input() readonly: boolean = false;
  @Input() height: number = 300;
  
  @Output() contentChange = new EventEmitter<string>();
  @Output() onSave = new EventEmitter<string>();
  
  @ViewChild('editor', { static: false }) editorRef!: ElementRef;

  isPreviewMode = false;
  editorContent = '';
  lastSavedContent = '';
  hasUnsavedChanges = false;
  isAutoSaving = false;
  autoSaveTimer: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.editorContent = this.content;
    this.lastSavedContent = this.content;
    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
  }

  onContentInput(event: Event): void {
    const target = event.target as HTMLElement;
    this.editorContent = target.innerHTML;
    this.onContentChange();
  }

  onContentChange(): void {
    this.hasUnsavedChanges = this.editorContent !== this.lastSavedContent;
    this.contentChange.emit(this.editorContent);
    this.resetAutoSaveTimer();
  }

  togglePreview(): void {
    this.isPreviewMode = !this.isPreviewMode;
  }

  saveContent(): void {
    this.onSave.emit(this.editorContent);
    this.lastSavedContent = this.editorContent;
    this.hasUnsavedChanges = false;
  }

  private setupAutoSave(): void {
    this.resetAutoSaveTimer();
  }

  private resetAutoSaveTimer(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(() => {
      if (this.hasUnsavedChanges) {
        this.autoSave();
      }
    }, 5000); // Auto-save after 5 seconds of inactivity
  }

  private autoSave(): void {
    if (!this.hasUnsavedChanges) return;
    
    this.isAutoSaving = true;
    // Simular guardado automático
    setTimeout(() => {
      this.lastSavedContent = this.editorContent;
      this.hasUnsavedChanges = false;
      this.isAutoSaving = false;
    }, 1000);
  }

  // Toolbar actions
  formatText(command: string, value?: string): void {
    if (this.readonly) return;
    
    if (isPlatformBrowser(this.platformId)) {
      document.execCommand(command, false, value);
      this.onContentChange();
    }
  }

  insertList(ordered: boolean = false): void {
    if (this.readonly) return;
    
    const command = ordered ? 'insertOrderedList' : 'insertUnorderedList';
    this.formatText(command);
  }

  createLink(): void {
    if (this.readonly) return;
    
    const url = prompt('Ingrese la URL:');
    if (url) {
      this.formatText('createLink', url);
    }
  }

  insertImage(): void {
    if (this.readonly) return;
    
    const url = prompt('Ingrese la URL de la imagen:');
    if (url) {
      this.formatText('insertImage', url);
    }
  }

  // Helper methods for toolbar state
  isCommandActive(command: string): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return document.queryCommandState(command);
  }
}
