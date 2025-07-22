import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {
  private RESERVATION_API_URL = 'https://api-node-rentify.onrender.com/api/reservations';


  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }


  /**
  * Creates a new reservation for a car.
  */
  createReservation(
    carId: string,
    startDate: Date,
    endDate: Date,
    discountApplied?: boolean,
    discountPercentage?: number
  ): Observable<any> {
    const reservationData: any = {
      carId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };


    if (discountApplied !== undefined) {
      reservationData.discountApplied = discountApplied;
      reservationData.discountPercentage = discountPercentage ?? 0;
    }

    console.log('Sending reservation data:', reservationData);

    return this.http.post(`${this.RESERVATION_API_URL}/createReservation`, reservationData, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError(error => {
        console.error('Error creating reservation:', error);
        return throwError(() => error);
      })
    );
  }



  /**
 * Fetches active reservations for the logged-in user.
 */
  getUserActiveReservations(): Observable<any[]> {
    return this.http.get(`${this.RESERVATION_API_URL}/getClientReservations`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map((response: any) => {
        if (response?.reservations && Array.isArray(response.reservations)) {
          return response.reservations;
        } else {
          console.warn('Unexpected API response format:', response);
          return [];
        }
      }),
      catchError(error => {
        console.error('Error fetching active reservations:', error);
        return throwError(() => error);
      })
    );
  }


  /**
 * Fetches all reservations (admin access).
 */
  getAllReservations(): Observable<any[]> {
    return this.http.get(`${this.RESERVATION_API_URL}/viewAdminAllReservations`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map((response: any) => {
        if (response?.reservations && Array.isArray(response.reservations)) {
          return response.reservations;
        } else {
          console.warn('Unexpected API response format:', response);
          return [];
        }
      }),
      catchError(error => {
        console.error('Error fetching all reservations:', error);
        return throwError(() => error);
      })
    );
  }


  /**
 * Updates the status of an existing reservation.
 */
  updateReservationStatus(reservationId: string, status: string): Observable<any> {
    const updateData = { status: status };

    console.log('Updating reservation status:', updateData);

    return this.http.put(`${this.RESERVATION_API_URL}/updateReservationStatus/${reservationId}`, updateData, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map((response: any) => {
        if (response && response.updatedReservation) {

          return response.updatedReservation;
        } else {
          console.warn('Unexpected API response format:', response);
          return null;
        }
      }),
      catchError(error => {
        console.error('Error updating reservation status:', error);
        let errorMessage = 'Unexpected error occurred';
        if (error.status === 0) {
          errorMessage = 'Network error';
        } else if (error.status === 400) {
          errorMessage = 'Invalid data provided';
        } else if (error.status === 500) {
          errorMessage = 'Server error';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
