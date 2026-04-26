import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarHomeComponent } from "../../layouts/navbar-home/navbar-home.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { ChatbotService } from '../../services/chatbot/chatbot.service';

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
  time: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, FormsModule, NavbarHomeComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewChecked {

  /* ===== Carrusel de marcas ===== */
  @Input() images: { src: string; alt: string }[] = [
    { src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM2fVimKBufYYSlPeWrADW7Eplh1DtW45J8w&s', alt: 'Logo de Ferrari' },
    { src: 'https://cdn.freebiesupply.com/logos/large/2x/bmw-logo-logo-png-transparent.png', alt: 'Logo de BMW' },
    { src: 'https://download.logo.wine/logo/Audi/Audi-Logo.wine.png', alt: 'Logo de Audi' },
    { src: 'https://cdn.freebiesupply.com/logos/large/2x/porsche-3-logo-png-transparent.png', alt: 'Logo de Porsche' },
    { src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPkGqT_r5T-OOveBDOI8cWvXnvZYiwNRUxBA&s', alt: 'Logo de Mercedes' },
    { src: 'https://cdn.freelogovectors.net/wp-content/uploads/2023/05/lincoln_logo-freelogovectors.net_.png', alt: 'Logo de Lincoln' },
    { src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcbZBeDtQXgjvvX2T4GRj7StL73tMICo7c3uOu1D5kvUIzhN97zzV-WJ6kxR8rCL-q86A&usqp=CAU', alt: 'Logo de Rolls Royce' },
    { src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZ-4OnhTdzBIujaFrOgJX5q9F96gB6YHRIKQ&s', alt: 'Logo de Tesla' },
    { src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQP5tXt0Y3sV-9QSNr1-8aBwspkm8y2E8LhfE-ney_gfE_0Ws0cGpP5KoETEjvOraR0gg&usqp=CAU', alt: 'Logo de Maserati' },
    { src: 'https://www.cdnlogo.com/logos/l/84/lamborghini.svg', alt: 'Logo de Lamborghini' },
    { src: 'https://static.vecteezy.com/system/resources/previews/001/199/293/non_2x/jaguar-logo-png.png', alt: 'Logo de Jaguar' },
  ];
  @Input() isAnimated: boolean = true;
  @Input() animationDuration: string = '70s';

  /* ===== Chatbot ===== */
  @ViewChild('chatBody') chatBody!: ElementRef;

  isChatOpen: boolean = false;
  isTyping: boolean = false;
  userInput: string = '';
  messages: ChatMessage[] = [];
  userId: string = 'user-' + Math.random().toString(36).substring(2, 9);
  private shouldScrollToBottom: boolean = false;

  constructor(private chatbotService: ChatbotService) { }

  ngOnInit(): void {
    // Mensaje de bienvenida inicial
    this.addBotMessage('👋 Bienvenido a Rentify 🚗\n¿Cuál es tu nombre?');
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      this.shouldScrollToBottom = true;
    }
  }

  async sendMessage(): Promise<void> {
    const text = this.userInput.trim();
    if (!text) return;

    // Agregar mensaje del usuario
    this.addUserMessage(text);
    this.userInput = '';
    this.isTyping = true;
    this.shouldScrollToBottom = true;

    try {
      const response = await this.chatbotService.processMessage(this.userId, text);
      this.isTyping = false;
      this.addBotMessage(response);
    } catch (error) {
      this.isTyping = false;
      this.addBotMessage('⚠️ Ocurrió un error. Por favor escribe "reset" para reiniciar.');
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private addBotMessage(text: string): void {
    this.messages.push({ from: 'bot', text, time: this.getTime() });
    this.shouldScrollToBottom = true;
  }

  private addUserMessage(text: string): void {
    this.messages.push({ from: 'user', text, time: this.getTime() });
  }

  private getTime(): string {
    return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    try {
      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    } catch { }
  }
}