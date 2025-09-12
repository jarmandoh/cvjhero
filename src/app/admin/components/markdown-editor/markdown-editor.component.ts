import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import hljs from 'highlight.js';

interface MarkdownEditorConfig {
  showPreview: boolean;
  showToolbar: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  placeholder: string;
  height: string;
}

@Component({
  selector: 'app-markdown-editor',
  imports: [CommonModule, FormsModule],
  templateUrl: './markdown-editor.component.html',
  styleUrl: './markdown-editor.component.css'
})
export class MarkdownEditorComponent implements OnInit, OnDestroy {
  @Input() value: string = '';
  @Input() config: Partial<MarkdownEditorConfig> = {};
  @Input() readonly: boolean = false;
  
  @Output() valueChange = new EventEmitter<string>();
  @Output() onSave = new EventEmitter<string>();
  @Output() onPreview = new EventEmitter<string>();
  
  @ViewChild('textareaEditor', { static: false }) textareaRef!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('previewContainer', { static: false }) previewRef!: ElementRef<HTMLDivElement>;

  // Configuration with defaults
  editorConfig: MarkdownEditorConfig = {
    showPreview: true,
    showToolbar: true,
    autoSave: true,
    autoSaveInterval: 3000,
    placeholder: 'Escribe tu contenido en Markdown...',
    height: '400px'
  };

  // State
  isPreviewMode = false;
  isFullscreen = false;
  isSplitView = true;
  markdownContent = '';
  htmlContent = '';
  hasUnsavedChanges = false;
  isAutoSaving = false;
  lastSavedContent = '';
  cursorPosition = 0;
  
  // Reactive streams
  private destroy$ = new Subject<void>();
  private contentChange$ = new Subject<string>();
  private autoSaveTimer: any;

  // Toolbar state
  toolbarItems = [
    { id: 'bold', icon: 'fas fa-bold', title: 'Negrita (Ctrl+B)', shortcut: 'Ctrl+B', syntax: '**texto**' },
    { id: 'italic', icon: 'fas fa-italic', title: 'Cursiva (Ctrl+I)', shortcut: 'Ctrl+I', syntax: '*texto*' },
    { id: 'strikethrough', icon: 'fas fa-strikethrough', title: 'Tachado', syntax: '~~texto~~' },
    { id: 'separator' },
    { id: 'h1', icon: 'fas fa-heading', title: 'Título 1', syntax: '# ' },
    { id: 'h2', icon: 'fas fa-heading', title: 'Título 2', syntax: '## ' },
    { id: 'h3', icon: 'fas fa-heading', title: 'Título 3', syntax: '### ' },
    { id: 'separator' },
    { id: 'quote', icon: 'fas fa-quote-left', title: 'Cita', syntax: '> ' },
    { id: 'code', icon: 'fas fa-code', title: 'Código inline', syntax: '`código`' },
    { id: 'code-block', icon: 'fas fa-file-code', title: 'Bloque de código', syntax: '```\ncódigo\n```' },
    { id: 'separator' },
    { id: 'link', icon: 'fas fa-link', title: 'Enlace', syntax: '[texto](url)' },
    { id: 'image', icon: 'fas fa-image', title: 'Imagen', syntax: '![alt](url)' },
    { id: 'table', icon: 'fas fa-table', title: 'Tabla', syntax: '| Col1 | Col2 |\n|------|------|\n| Data | Data |' },
    { id: 'separator' },
    { id: 'ul', icon: 'fas fa-list-ul', title: 'Lista sin numerar', syntax: '- ' },
    { id: 'ol', icon: 'fas fa-list-ol', title: 'Lista numerada', syntax: '1. ' },
    { id: 'task', icon: 'fas fa-check-square', title: 'Lista de tareas', syntax: '- [ ] ' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Merge configuration
    this.editorConfig = { ...this.editorConfig, ...this.config };
    
    // Initialize content
    this.markdownContent = this.value;
    this.lastSavedContent = this.value;
    this.updatePreview();
    
    // Setup reactive content changes
    this.setupContentObserver();
    
    // Setup markdown renderer
    this.setupMarkedRenderer();
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
  }

  private setupContentObserver(): void {
    this.contentChange$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(content => {
        this.updatePreview();
        this.valueChange.emit(content);
        this.checkForUnsavedChanges();
        this.setupAutoSave();
      });
  }

  private setupMarkedRenderer(): void {
    if (isPlatformBrowser(this.platformId)) {
      const renderer = new marked.Renderer();
      
      renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            const highlighted = hljs.highlight(text, { language: lang }).value;
            return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
          } catch (err) {
            console.warn('Error highlighting code:', err);
          }
        }
        return `<pre><code>${text}</code></pre>`;
      };

      marked.setOptions({
        renderer,
        breaks: true,
        gfm: true
      });
    }
  }

  private setupKeyboardShortcuts(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            this.insertSyntax('bold');
            break;
          case 'i':
            e.preventDefault();
            this.insertSyntax('italic');
            break;
          case 's':
            e.preventDefault();
            this.saveContent();
            break;
          case 'Enter':
            if (e.shiftKey) {
              e.preventDefault();
              this.togglePreviewMode();
            }
            break;
        }
      }
    });
  }

  onContentChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.markdownContent = target.value;
    this.cursorPosition = target.selectionStart;
    this.contentChange$.next(this.markdownContent);
  }

  private updatePreview(): void {
    try {
      this.htmlContent = marked(this.markdownContent) as string;
      this.onPreview.emit(this.htmlContent);
    } catch (error) {
      console.error('Error parsing markdown:', error);
      this.htmlContent = '<p>Error al procesar el markdown</p>';
    }
  }

  // Toolbar actions
  insertSyntax(type: string): void {
    if (this.readonly || !this.textareaRef) return;

    const textarea = this.textareaRef.nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const toolbarItem = this.toolbarItems.find(item => item.id === type);
    if (!toolbarItem || !toolbarItem.syntax) return;

    let newText = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        newText = `**${selectedText || 'texto en negrita'}**`;
        cursorOffset = selectedText ? 0 : -2;
        break;
      case 'italic':
        newText = `*${selectedText || 'texto en cursiva'}*`;
        cursorOffset = selectedText ? 0 : -1;
        break;
      case 'strikethrough':
        newText = `~~${selectedText || 'texto tachado'}~~`;
        cursorOffset = selectedText ? 0 : -2;
        break;
      case 'h1':
      case 'h2':
      case 'h3':
        const level = type.slice(-1);
        newText = '#'.repeat(Number(level)) + ` ${selectedText || 'Título'}`;
        cursorOffset = selectedText ? 0 : 0;
        break;
      case 'quote':
        newText = `> ${selectedText || 'Cita'}`;
        cursorOffset = selectedText ? 0 : 0;
        break;
      case 'code':
        newText = `\`${selectedText || 'código'}\``;
        cursorOffset = selectedText ? 0 : -1;
        break;
      case 'code-block':
        newText = `\`\`\`\n${selectedText || 'código'}\n\`\`\``;
        cursorOffset = selectedText ? 0 : -4;
        break;
      case 'link':
        const url = prompt('Ingrese la URL:') || '#';
        newText = `[${selectedText || 'texto del enlace'}](${url})`;
        cursorOffset = 0;
        break;
      case 'image':
        const imageUrl = prompt('Ingrese la URL de la imagen:') || '#';
        const alt = selectedText || 'descripción';
        newText = `![${alt}](${imageUrl})`;
        cursorOffset = 0;
        break;
      case 'ul':
        newText = `- ${selectedText || 'elemento de lista'}`;
        cursorOffset = selectedText ? 0 : 0;
        break;
      case 'ol':
        newText = `1. ${selectedText || 'elemento numerado'}`;
        cursorOffset = selectedText ? 0 : 0;
        break;
      case 'task':
        newText = `- [ ] ${selectedText || 'tarea pendiente'}`;
        cursorOffset = selectedText ? 0 : 0;
        break;
      case 'table':
        newText = `| Columna 1 | Columna 2 |\n|-----------|----------|\n| Dato 1    | Dato 2    |`;
        cursorOffset = 0;
        break;
      default:
        return;
    }

    // Insert the new text
    const newContent = 
      textarea.value.substring(0, start) + 
      newText + 
      textarea.value.substring(end);
    
    this.markdownContent = newContent;
    
    // Update cursor position
    setTimeout(() => {
      const newCursorPos = start + newText.length + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    });

    this.contentChange$.next(this.markdownContent);
  }

  // View controls
  togglePreviewMode(): void {
    this.isPreviewMode = !this.isPreviewMode;
    if (this.isPreviewMode) {
      this.isSplitView = false;
    }
  }

  toggleSplitView(): void {
    this.isSplitView = !this.isSplitView;
    if (this.isSplitView) {
      this.isPreviewMode = false;
    }
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  // Save functionality
  saveContent(): void {
    this.onSave.emit(this.markdownContent);
    this.lastSavedContent = this.markdownContent;
    this.hasUnsavedChanges = false;
    this.isAutoSaving = false;
  }

  private setupAutoSave(): void {
    if (!this.editorConfig.autoSave) return;

    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(() => {
      if (this.hasUnsavedChanges && !this.readonly) {
        this.isAutoSaving = true;
        this.saveContent();
      }
    }, this.editorConfig.autoSaveInterval);
  }

  private checkForUnsavedChanges(): void {
    this.hasUnsavedChanges = this.markdownContent !== this.lastSavedContent;
  }

  // Utility methods
  getWordCount(): number {
    return this.markdownContent.split(/\s+/).filter(word => word.length > 0).length;
  }

  getCharacterCount(): number {
    return this.markdownContent.length;
  }

  getReadingTime(): number {
    const wordsPerMinute = 200;
    const words = this.getWordCount();
    return Math.ceil(words / wordsPerMinute);
  }
}