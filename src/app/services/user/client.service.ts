import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UpdateClientData } from '../../models/client/update-client-data';
import { ClientResponse } from '../../models/client/client-response';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private readonly API = 'https://api-backend-rentify.onrender.com/api/client';

  constructor(private http: HttpClient) { }

  getClientInfo(): Observable<ClientResponse> {
    return this.http.get<ClientResponse>(`${this.API}/clientGetData`);
  }

  updateClientInfo(data: UpdateClientData): Observable<any> {
    return this.http.put(`${this.API}/clientUpdate`, data);
  }

  deleteClientAccount(): Observable<any> {
    return this.http.delete(`${this.API}/clientDelete`);
  }
}