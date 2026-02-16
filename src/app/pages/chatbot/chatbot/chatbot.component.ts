import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatbotService } from 'src/app/services/chatbot/chatbot.service';

interface Message {
  from: 'user' | 'bot';
  text: string;
  time: string;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  // Estado del chat
  isOpen: boolean = false;

  // Input del usuario
  userMessage: string = '';

  // Historial de mensajes (con timestamp)
  messages: Message[] = [];

  // Indicador de escritura
  isTyping: boolean = false;

  // Mostrar sugerencias rápidas
  showSuggestions: boolean = true;

  // Control de scroll automático
  private shouldScrollToBottom = true;

  constructor(private chatbotService: ChatbotService) { }

  ngOnInit(): void {
    this.resetChat();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
    }
  }

  /**
   * Abre/cierra el chat
   */
  toggleChat(): void {
    this.isOpen = !this.isOpen;

    // Si se cierra el chat → limpiar sesión
    if (!this.isOpen) {
      localStorage.removeItem('chatUser');
      this.resetChat();
    } else {
      // Si se abre y no hay mensajes, mostrar bienvenida
      if (this.messages.length === 0) {
        this.resetChat();
      }
    }
  }

  /**
   * Reinicia el chat completo
   */
  resetChat(): void {
    this.messages = [];
    this.userMessage = '';
    this.showSuggestions = true;
    this.isTyping = false;

    // Mensaje inicial de bienvenida
    this.addBotMessage('👋 Bienvenido a Rentify 🚗\n¿Cuál es tu nombre?');

    // Nueva sesión
    localStorage.setItem('chatUser', crypto.randomUUID());
  }

  /**
   * Envía un mensaje del usuario
   */
  sendMessage(): void {
    const message = this.userMessage.trim();

    if (!message) return;

    // Agregar mensaje del usuario
    this.addUserMessage(message);

    // Limpiar input
    this.userMessage = '';

    // Mostrar indicador de escritura
    this.isTyping = true;
    this.shouldScrollToBottom = true;

    // Enviar al backend con delay simulado para mejor UX
    setTimeout(() => {
      this.chatbotService.sendMessage(message).subscribe({
        next: (res) => {
          this.isTyping = false;
          this.addBotMessage(res.response);

          // Ocultar sugerencias después del primer mensaje
          if (this.messages.length > 2) {
            this.showSuggestions = false;
          }
        },
        error: (error) => {
          this.isTyping = false;
          console.error('Error al enviar mensaje:', error);
          this.addBotMessage('⚠️ Lo siento, hubo un error. Por favor intenta de nuevo.');
        }
      });
    }, 300); // Pequeño delay para que se vea más natural
  }

  /**
   * Envía un mensaje rápido desde los botones de sugerencia
   */
  sendQuickMessage(message: string): void {
    this.userMessage = message;
    this.sendMessage();
  }

  /**
   * Agrega un mensaje del usuario al historial
   */
  private addUserMessage(text: string): void {
    this.messages.push({
      from: 'user',
      text: text,
      time: this.getCurrentTime()
    });
    this.shouldScrollToBottom = true;
  }

  /**
   * Agrega un mensaje del bot al historial
   */
  private addBotMessage(text: string): void {
    this.messages.push({
      from: 'bot',
      text: text,
      time: this.getCurrentTime()
    });
    this.shouldScrollToBottom = true;
  }

  /**
   * Obtiene la hora actual en formato HH:MM
   */
  private getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Hace scroll hasta el último mensaje
   */
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      // Silenciar error si el elemento no está disponible
    }
  }

  /**
   * Maneja el evento de scroll manual del usuario
   */
  onScroll(): void {
    // Si el usuario hace scroll manual, desactivar auto-scroll temporalmente
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      const isAtBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
      this.shouldScrollToBottom = isAtBottom;
    }
  }
}