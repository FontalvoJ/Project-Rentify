import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  // Endpoint del backend
  private API_URL = 'http://localhost:3030/api/chatbot';

  constructor(private http: HttpClient) { }

  // Enviar mensaje al chatbot
  sendMessage(message: string): Observable<any> {
    const userId = localStorage.getItem('chatUser') || 'guest';

    return this.http.post<any>(this.API_URL, {
      message,
      userId
    });
  }
}
