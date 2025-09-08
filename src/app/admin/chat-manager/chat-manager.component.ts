import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { ChatSession, ChatMessage, ChatNotification } from '../../models/chat-message.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-chat-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chat-manager.component.html',
  styleUrl: './chat-manager.component.css'
})
export class ChatManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  sessions: ChatSession[] = [];
  selectedSession: ChatSession | null = null;
  notifications: ChatNotification[] = [];
  messageForm: FormGroup;
  
  // Filtros y estado
  sessionFilter: 'all' | 'active' | 'waiting' | 'closed' = 'all';
  unreadCount = 0;

  constructor(
    private chatService: ChatService,
    private fb: FormBuilder
  ) {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    // Suscribirse a las sesiones de chat
    this.chatService.getChatSessions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(sessions => {
        this.sessions = sessions;
        this.updateUnreadCount();
      });

    // Suscribirse a las notificaciones
    this.chatService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications.slice(0, 10); // Mostrar solo las últimas 10
      });

    // Suscribirse al contador de no leídos
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

  // Filtrar sesiones
  getFilteredSessions(): ChatSession[] {
    if (this.sessionFilter === 'all') {
      return this.sessions;
    }
    return this.sessions.filter(session => session.status === this.sessionFilter);
  }

  // Seleccionar sesión
  selectSession(session: ChatSession): void {
    this.selectedSession = session;
    
    // Marcar mensajes de usuario como leídos
    this.chatService.markMessagesAsRead(session.id, 'user');
  }

  // Enviar mensaje desde admin
  sendAdminMessage(): void {
    if (this.messageForm.valid && this.selectedSession) {
      const message = this.messageForm.value.message.trim();
      if (message) {
        this.chatService.sendAdminMessage(this.selectedSession.id, message);
        this.messageForm.reset();
      }
    }
  }

  // Cerrar sesión
  closeSession(session: ChatSession): void {
    if (confirm('¿Estás seguro de que quieres cerrar esta sesión de chat?')) {
      this.chatService.closeSession(session.id);
      if (this.selectedSession?.id === session.id) {
        this.selectedSession = null;
      }
    }
  }

  // Cambiar filtro
  setFilter(filter: 'all' | 'active' | 'waiting' | 'closed'): void {
    this.sessionFilter = filter;
  }

  // Formateo de tiempo
  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Ahora mismo';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return new Date(date).toLocaleDateString('es-ES');
  }

  getMessageTime(timestamp: Date): string {
    return new Date(timestamp).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Obtener último mensaje de la sesión
  getLastMessage(session: ChatSession): string {
    if (session.messages.length === 0) return 'Sin mensajes';
    const lastMessage = session.messages[session.messages.length - 1];
    const preview = lastMessage.message.substring(0, 50);
    return lastMessage.message.length > 50 ? preview + '...' : preview;
  }

  // Contar mensajes no leídos por sesión
  getUnreadMessagesCount(session: ChatSession): number {
    return session.messages.filter(msg => !msg.isRead && msg.sender === 'user').length;
  }

  // Obtener color del estado
  getStatusColor(status: ChatSession['status']): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Obtener texto del estado
  getStatusText(status: ChatSession['status']): string {
    switch (status) {
      case 'active': return 'Activa';
      case 'waiting': return 'Esperando';
      case 'closed': return 'Cerrada';
      default: return 'Desconocido';
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

  // Obtener conteo por filtro
  getSessionCountByStatus(status: 'all' | 'active' | 'waiting' | 'closed'): number {
    if (status === 'all') return this.sessions.length;
    return this.sessions.filter(session => session.status === status).length;
  }

  private updateUnreadCount(): void {
    this.unreadCount = this.sessions.reduce((total, session) => {
      return total + session.messages.filter(msg => !msg.isRead && msg.sender === 'user').length;
    }, 0);
  }

  // Manejar enter en textarea
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendAdminMessage();
    }
  }
}
