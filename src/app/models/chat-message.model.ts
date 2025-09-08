export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'admin' | 'bot';
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'file' | 'quick-reply';
  metadata?: {
    userName?: string;
    userEmail?: string;
    botResponse?: boolean;
    quickReplies?: QuickReply[];
  };
}

export interface QuickReply {
  id: string;
  text: string;
  action: string;
}

export interface ChatSession {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'waiting' | 'closed';
  messages: ChatMessage[];
  lastActivity: Date;
  assignedAdmin?: string;
}

export interface BotResponse {
  id: string;
  triggers: string[];
  response: string;
  quickReplies?: QuickReply[];
  isActive: boolean;
  priority: number;
}

export interface ChatNotification {
  id: string;
  sessionId: string;
  message: string;
  type: 'new_message' | 'new_session' | 'user_waiting';
  timestamp: Date;
  isRead: boolean;
}
