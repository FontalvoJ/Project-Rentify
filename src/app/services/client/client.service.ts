import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private CLIENT_API_URL = 'https://api-node-rentify.onrender.com/api/client';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getClientInfo(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.CLIENT_API_URL}/clientGetData`, { headers });
  }

  updateClientInfo(clientData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put<any>(`${this.CLIENT_API_URL}/clientUpdate`, clientData, { headers });
  }

  deleteClientAccount(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.CLIENT_API_URL}/clientDelete`, { headers });
  }

}
