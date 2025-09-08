import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { ChatMessage, ChatSession, QuickReply } from '../../models/chat-message.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.css'
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  isOpen = false;
  currentSession: ChatSession | null = null;
  messages: ChatMessage[] = [];
  unreadCount = 0;
  isTyping = false;
  showUserForm = false;
  
  messageForm: FormGroup;
  userInfoForm: FormGroup;

  constructor(
    private chatService: ChatService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.userInfoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]]
    });
  }

  ngOnInit(): void {
    // Suscribirse a los cambios del estado del widget
    this.chatService.getWidgetState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isOpen = isOpen;
      });

    // Suscribirse a la sesión activa
    this.chatService.getActiveSession()
      .pipe(takeUntil(this.destroy$))
      .subscribe(session => {
        this.currentSession = session;
        this.messages = session ? [...session.messages] : [];
        
        // Auto-scroll al último mensaje
        setTimeout(() => this.scrollToBottom(), 100);
      });

    // Suscribirse al contador de mensajes no leídos
    this.chatService.getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleWidget(): void {
    this.chatService.toggleWidget();
  }

  closeWidget(): void {
    this.chatService.closeWidget();
  }

  sendMessage(): void {
    if (this.messageForm.valid) {
      const message = this.messageForm.value.message.trim();
      if (message) {
        this.isTyping = true;
        
        const userName = this.userInfoForm.value.name || undefined;
        const userEmail = this.userInfoForm.value.email || undefined;
        
        this.chatService.sendMessage(message, userName, userEmail);
        this.messageForm.reset();
        
        // Simular que el bot está escribiendo
        setTimeout(() => {
          this.isTyping = false;
        }, 1500);
      }
    }
  }

  handleQuickReply(quickReply: QuickReply): void {
    if (this.currentSession) {
      // Simular que el usuario hizo clic en la respuesta rápida
      this.chatService.sendMessage(quickReply.text);
      
      // Manejar la acción específica
      setTimeout(() => {
        this.chatService.handleQuickReply(quickReply.action, this.currentSession!);
      }, 500);
    }
  }

  toggleUserForm(): void {
    this.showUserForm = !this.showUserForm;
  }

  saveUserInfo(): void {
    if (this.userInfoForm.valid && this.currentSession) {
      const { name, email } = this.userInfoForm.value;
      
      // Actualizar la sesión con la información del usuario
      this.currentSession.userName = name || this.currentSession.userName;
      this.currentSession.userEmail = email || this.currentSession.userEmail;
      
      this.showUserForm = false;
      
      // Enviar un mensaje de confirmación
      const confirmMessage = `Perfecto, ${name}! Ya tengo tu información. ¿En qué más puedo ayudarte?`;
      setTimeout(() => {
        if (this.currentSession) {
          this.chatService.handleQuickReply('user_info_saved', this.currentSession);
        }
      }, 500);
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  getMessageTime(timestamp: Date): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  private scrollToBottom(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const messagesContainer = document.querySelector('.chat-messages');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      } catch (error) {
        console.warn('Error scrolling to bottom:', error);
      }
    }
  }

  // Funciones de utilidad para el template
  isUserMessage(message: ChatMessage): boolean {
    return message.sender === 'user';
  }

  isBotMessage(message: ChatMessage): boolean {
    return message.sender === 'bot';
  }

  isAdminMessage(message: ChatMessage): boolean {
    return message.sender === 'admin';
  }

  hasQuickReplies(message: ChatMessage): boolean {
    return !!(message.metadata?.quickReplies && message.metadata.quickReplies.length > 0);
  }

  getQuickReplies(message: ChatMessage): QuickReply[] {
    return message.metadata?.quickReplies || [];
  }
}
