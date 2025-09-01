import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly CLIENT_API_URL = 'http://localhost:3030/api/client';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getClientInfo(): Observable<any> {
    return this.http.get<any>(`${this.CLIENT_API_URL}/clientGetData`, { headers: this.getAuthHeaders() });
  }

  updateClientInfo(clientData: any): Observable<any> {
    return this.http.put<any>(`${this.CLIENT_API_URL}/clientUpdate`, clientData, { headers: this.getAuthHeaders() });
  }

  deleteClientAccount(): Observable<any> {
    return this.http.delete<any>(`${this.CLIENT_API_URL}/clientDelete`, { headers: this.getAuthHeaders() });
  }

}
