import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { ChatMessage, ChatSession, BotResponse, ChatNotification, QuickReply } from '../models/chat-message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chatSessions$ = new BehaviorSubject<ChatSession[]>([]);
  private activeSession$ = new BehaviorSubject<ChatSession | null>(null);
  private isWidgetOpen$ = new BehaviorSubject<boolean>(false);
  private unreadCount$ = new BehaviorSubject<number>(0);
  private notifications$ = new BehaviorSubject<ChatNotification[]>([]);

  // Respuestas automáticas del bot
  private botResponses: BotResponse[] = [
    {
      id: '1',
      triggers: ['hola', 'hello', 'hi', 'buenas', 'saludos'],
      response: '¡Hola! 👋 Soy el asistente virtual de Janier. ¿En qué puedo ayudarte hoy?',
      quickReplies: [
        { id: '1', text: '💼 Ver proyectos', action: 'show_projects' },
        { id: '2', text: '📧 Contactar', action: 'show_contact' },
        { id: '3', text: '📄 Descargar CV', action: 'download_cv' }
      ],
      isActive: true,
      priority: 1
    },
    {
      id: '2',
      triggers: ['proyectos', 'trabajo', 'portfolio', 'projects'],
      response: 'Te muestro algunos de los proyectos destacados de Janier:\n\n🚀 CVJHero - Este mismo portafolio\n💼 Sistema de gestión empresarial\n🛒 E-commerce con Angular\n\n¿Te interesa alguno en particular?',
      quickReplies: [
        { id: '1', text: '🔍 Ver detalles', action: 'project_details' },
        { id: '2', text: '💬 Hablar con Janier', action: 'contact_admin' }
      ],
      isActive: true,
      priority: 2
    },
    {
      id: '3',
      triggers: ['contacto', 'contactar', 'contact', 'hablar'],
      response: 'Perfecto! Puedes contactar con Janier de varias formas:\n\n📧 Email: janier@example.com\n💼 LinkedIn: linkedin.com/in/janier\n📱 WhatsApp: +57 123 456 7890\n\n¿Prefieres que te conecte directamente con él?',
      quickReplies: [
        { id: '1', text: '✅ Conectar ahora', action: 'connect_admin' },
        { id: '2', text: '📝 Dejar mensaje', action: 'leave_message' }
      ],
      isActive: true,
      priority: 2
    },
    {
      id: '4',
      triggers: ['cv', 'curriculum', 'resume', 'descargar'],
      response: '📄 ¡Perfecto! Puedes descargar el CV de Janier en formato PDF. También puedes ver su experiencia completa en la sección de experiencia del portafolio.',
      quickReplies: [
        { id: '1', text: '⬇️ Descargar PDF', action: 'download_cv' },
        { id: '2', text: '👁️ Ver online', action: 'view_experience' }
      ],
      isActive: true,
      priority: 2
    },
    {
      id: '5',
      triggers: ['ayuda', 'help', 'que puedes hacer', 'opciones'],
      response: 'Puedo ayudarte con:\n\n🔍 Información sobre proyectos\n📞 Datos de contacto\n📄 Descargar CV\n💼 Servicios disponibles\n🤖 Responder preguntas frecuentes\n\n¿Qué te interesa más?',
      quickReplies: [
        { id: '1', text: '💼 Servicios', action: 'show_services' },
        { id: '2', text: '❓ FAQ', action: 'show_faq' }
      ],
      isActive: true,
      priority: 1
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadChatData();
      // Simular actividad de usuario cada 30 segundos
      interval(30000).subscribe(() => {
        this.updateLastActivity();
      });
    }
  }

  // Observables públicos
  getChatSessions(): Observable<ChatSession[]> {
    return this.chatSessions$.asObservable();
  }

  getActiveSession(): Observable<ChatSession | null> {
    return this.activeSession$.asObservable();
  }

  getWidgetState(): Observable<boolean> {
    return this.isWidgetOpen$.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  getNotifications(): Observable<ChatNotification[]> {
    return this.notifications$.asObservable();
  }

  // Gestión del widget
  toggleWidget(): void {
    const currentState = this.isWidgetOpen$.value;
    this.isWidgetOpen$.next(!currentState);
    
    if (!currentState && !this.activeSession$.value) {
      this.startNewSession();
    }
  }

  closeWidget(): void {
    this.isWidgetOpen$.next(false);
  }

  openWidget(): void {
    this.isWidgetOpen$.next(true);
    if (!this.activeSession$.value) {
      this.startNewSession();
    }
  }

  // Gestión de sesiones
  startNewSession(userName?: string, userEmail?: string): ChatSession {
    const sessionId = this.generateId();
    const session: ChatSession = {
      id: sessionId,
      userName: userName || 'Visitante',
      userEmail,
      startTime: new Date(),
      status: 'active',
      messages: [],
      lastActivity: new Date()
    };

    // Mensaje de bienvenida del bot
    const welcomeMessage: ChatMessage = {
      id: this.generateId(),
      sessionId,
      sender: 'bot',
      message: '¡Hola! 👋 Bienvenido al portafolio de Janier Hernández. Soy su asistente virtual. ¿En qué puedo ayudarte?',
      timestamp: new Date(),
      isRead: false,
      type: 'text',
      metadata: {
        botResponse: true,
        quickReplies: [
          { id: '1', text: '💼 Ver proyectos', action: 'show_projects' },
          { id: '2', text: '📧 Contactar', action: 'show_contact' },
          { id: '3', text: '❓ Ayuda', action: 'show_help' }
        ]
      }
    };

    session.messages.push(welcomeMessage);
    
    const sessions = this.chatSessions$.value;
    sessions.unshift(session);
    this.chatSessions$.next(sessions);
    this.activeSession$.next(session);
    
    this.saveToStorage();
    return session;
  }

  // Envío de mensajes
  sendMessage(message: string, userName?: string, userEmail?: string): void {
    let session = this.activeSession$.value;
    
    if (!session) {
      session = this.startNewSession(userName, userEmail);
    }

    // Actualizar información del usuario si se proporciona
    if (userName && !session.userName) {
      session.userName = userName;
    }
    if (userEmail && !session.userEmail) {
      session.userEmail = userEmail;
    }

    const userMessage: ChatMessage = {
      id: this.generateId(),
      sessionId: session.id,
      sender: 'user',
      message: message.trim(),
      timestamp: new Date(),
      isRead: false,
      type: 'text',
      metadata: {
        userName: session.userName,
        userEmail: session.userEmail
      }
    };

    session.messages.push(userMessage);
    session.lastActivity = new Date();
    this.updateSession(session);

    // Procesar respuesta automática del bot
    setTimeout(() => {
      this.processBotResponse(message, session!);
    }, 1000);

    // Crear notificación para admin
    this.createNotification(session.id, `Nuevo mensaje de ${session.userName}: ${message}`, 'new_message');
  }

  // Procesar respuesta del bot
  private processBotResponse(userMessage: string, session: ChatSession): void {
    const normalizedMessage = userMessage.toLowerCase().trim();
    
    // Buscar respuesta del bot
    let botResponse = this.botResponses.find(response => 
      response.isActive && response.triggers.some(trigger => 
        normalizedMessage.includes(trigger.toLowerCase())
      )
    );

    // Respuesta por defecto si no hay coincidencia
    if (!botResponse) {
      botResponse = {
        id: 'default',
        triggers: [],
        response: 'Gracias por tu mensaje. Un momento por favor, voy a conectarte con Janier para que pueda ayudarte mejor. Mientras tanto, puedes explorar sus proyectos o descargar su CV.',
        quickReplies: [
          { id: '1', text: '💼 Ver proyectos', action: 'show_projects' },
          { id: '2', text: '📄 Descargar CV', action: 'download_cv' },
          { id: '3', text: '👨‍💻 Conectar con Janier', action: 'connect_admin' }
        ],
        isActive: true,
        priority: 0
      };
    }

    const botMessage: ChatMessage = {
      id: this.generateId(),
      sessionId: session.id,
      sender: 'bot',
      message: botResponse.response,
      timestamp: new Date(),
      isRead: false,
      type: 'text',
      metadata: {
        botResponse: true,
        quickReplies: botResponse.quickReplies
      }
    };

    session.messages.push(botMessage);
    session.lastActivity = new Date();
    this.updateSession(session);
  }

  // Manejar acciones de respuestas rápidas
  handleQuickReply(action: string, session: ChatSession): void {
    let responseMessage = '';
    let quickReplies: QuickReply[] = [];

    switch (action) {
      case 'show_projects':
        responseMessage = '🚀 Aquí tienes algunos proyectos destacados:\n\n• CVJHero - Portafolio personal\n• Sistema ERP\n• E-commerce Angular\n• App móvil React Native\n\n¿Te gustaría ver alguno en detalle?';
        quickReplies = [
          { id: '1', text: '🔍 Ver CVJHero', action: 'project_cvjhero' },
          { id: '2', text: '💼 Ver todos', action: 'all_projects' }
        ];
        break;
      
      case 'show_contact':
        responseMessage = '📞 Información de contacto:\n\n📧 Email: janier@example.com\n💼 LinkedIn: /in/janier-hernandez\n📱 WhatsApp: +57 123 456 7890\n🐙 GitHub: /jarmandoh\n\n¿Prefieres que te conecte directamente?';
        quickReplies = [
          { id: '1', text: '✅ Conectar ahora', action: 'connect_admin' },
          { id: '2', text: '📝 Enviar mensaje', action: 'send_email' }
        ];
        break;

      case 'download_cv':
        responseMessage = '📄 ¡Perfecto! Aquí puedes descargar el CV de Janier en formato PDF actualizado.';
        // En una implementación real, aquí se iniciaría la descarga
        break;

      case 'connect_admin':
        responseMessage = '👨‍💻 Conectando con Janier... Te responderá en breve. Mientras tanto, puedes contarme más sobre tu consulta.';
        session.status = 'waiting';
        this.createNotification(session.id, `Usuario ${session.userName} solicita conexión directa`, 'user_waiting');
        break;

      default:
        responseMessage = 'Entendido. ¿Hay algo más en lo que pueda ayudarte?';
    }

    const botMessage: ChatMessage = {
      id: this.generateId(),
      sessionId: session.id,
      sender: 'bot',
      message: responseMessage,
      timestamp: new Date(),
      isRead: false,
      type: 'quick-reply',
      metadata: {
        botResponse: true,
        quickReplies
      }
    };

    session.messages.push(botMessage);
    session.lastActivity = new Date();
    this.updateSession(session);
  }

  // Enviar mensaje desde admin
  sendAdminMessage(sessionId: string, message: string): void {
    const session = this.chatSessions$.value.find(s => s.id === sessionId);
    if (!session) return;

    const adminMessage: ChatMessage = {
      id: this.generateId(),
      sessionId,
      sender: 'admin',
      message: message.trim(),
      timestamp: new Date(),
      isRead: false,
      type: 'text'
    };

    session.messages.push(adminMessage);
    session.status = 'active';
    session.lastActivity = new Date();
    this.updateSession(session);
  }

  // Marcar mensajes como leídos
  markMessagesAsRead(sessionId: string, sender: 'user' | 'admin'): void {
    const session = this.chatSessions$.value.find(s => s.id === sessionId);
    if (!session) return;

    session.messages.forEach(msg => {
      if (msg.sender === sender && !msg.isRead) {
        msg.isRead = true;
      }
    });

    this.updateSession(session);
    this.updateUnreadCount();
  }

  // Cerrar sesión
  closeSession(sessionId: string): void {
    const session = this.chatSessions$.value.find(s => s.id === sessionId);
    if (session) {
      session.status = 'closed';
      session.endTime = new Date();
      this.updateSession(session);
      
      if (this.activeSession$.value?.id === sessionId) {
        this.activeSession$.next(null);
      }
    }
  }

  // Utilidades
  private updateSession(session: ChatSession): void {
    const sessions = this.chatSessions$.value;
    const index = sessions.findIndex(s => s.id === session.id);
    if (index !== -1) {
      sessions[index] = session;
      this.chatSessions$.next([...sessions]);
      
      if (this.activeSession$.value?.id === session.id) {
        this.activeSession$.next(session);
      }
      
      this.saveToStorage();
      this.updateUnreadCount();
    }
  }

  private updateLastActivity(): void {
    const session = this.activeSession$.value;
    if (session && session.status === 'active') {
      session.lastActivity = new Date();
      this.updateSession(session);
    }
  }

  private updateUnreadCount(): void {
    const sessions = this.chatSessions$.value;
    let unreadCount = 0;
    
    sessions.forEach(session => {
      session.messages.forEach(msg => {
        if (!msg.isRead && msg.sender === 'user') {
          unreadCount++;
        }
      });
    });
    
    this.unreadCount$.next(unreadCount);
  }

  private createNotification(sessionId: string, message: string, type: ChatNotification['type']): void {
    const notification: ChatNotification = {
      id: this.generateId(),
      sessionId,
      message,
      type,
      timestamp: new Date(),
      isRead: false
    };

    const notifications = this.notifications$.value;
    notifications.unshift(notification);
    this.notifications$.next(notifications);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private saveToStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('cvjhero_chat_sessions', JSON.stringify(this.chatSessions$.value));
      } catch (error) {
        console.warn('Error saving chat data to localStorage:', error);
      }
    }
  }

  private loadChatData(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const saved = localStorage.getItem('cvjhero_chat_sessions');
        if (saved) {
          const sessions = JSON.parse(saved);
          this.chatSessions$.next(sessions);
          this.updateUnreadCount();
        }
      } catch (error) {
        console.warn('Error loading chat data from localStorage:', error);
      }
    }
  }
}
