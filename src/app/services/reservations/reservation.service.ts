import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { CreateReservationDTO } from '../../models/reservations/create-reservation.dto';
import { Reservation } from '../../models/reservations/reservation.dto';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private API_URL = `${environment.api.baseUrl}/reservations/`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Genera headers de autenticación con el token JWT del usuario logueado
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  /**
   * Manejo de errores centralizado
   */
  private handleError(error: any): Observable<never> {
    //console.error('Error en reservas:', error);
    return throwError(() => error);
  }

  /**
   * Crear reserva (solo clientes)
   */
  createReservation(data: CreateReservationDTO): Observable<any> {

    const headers = this.getAuthHeaders();

    return this.http.post<{ message: string; data: any }>(
      `${this.API_URL}createReservation`,
      data,
      { headers }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }


  /**
   * Listar reservas (cliente o admin)
   */
  getReservations(): Observable<Reservation[]> {

    const headers = this.getAuthHeaders();

    return this.http
      .get<{ data: any[] }>(
        `${this.API_URL}listReservations`,
        { headers }
      )
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar estado de reserva (solo admin)
   */
  updateReservationStatus(reservationId: string, status: string): Observable<any> {

    if (!reservationId) {
      return throwError(() => new Error('ID de reserva requerido'));
    }

    const headers = this.getAuthHeaders();

    return this.http.patch<{ message: string; data: any }>(
      `${this.API_URL}updateStatus/${reservationId}`,
      { status },
      { headers }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
 * Registrar pago de una reserva (solo admin)
 */
  registerPayment(reservationId: string): Observable<any> {

    if (!reservationId) {
      return throwError(() => new Error('ID de reserva requerido'));
    }

    const headers = this.getAuthHeaders();

    return this.http.patch<{ message: string; data: any }>(
      `${this.API_URL}registerPayment/${reservationId}`,
      {},
      { headers }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

}