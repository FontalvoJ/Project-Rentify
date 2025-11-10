import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class CarService {
  private API_URL = 'http://localhost:3030/api/cars/';
  private carsCache: any[] | null = null;

  constructor(private http: HttpClient) { }

  /**
 * Gets all cars available for all users (without authentication).
 */
  getAllCarsForEveryone(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}allCars`)
      .pipe(
        catchError(this.handleError)
      );
  }


  /**
   * Limpia la caché (si un auto se crea, actualiza o elimina).
   */
  clearCache(): void {
    this.carsCache = null;
  }

  /**
* Gets the headers with the authentication token.
*/
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /**
* Checks if the current user is an administrator.
*/
  private isAdmin(): boolean {
    const role = localStorage.getItem('role');
    return role === 'admin';
  }

  /**
* Generic error handling for HTTP requests.
*/
  private handleError(error: any): Observable<never> {
    console.error('HTTP Error:', error);
    alert('An error occurred. Please try again.');
    return throwError(() => error);
  }

  /**
 * Crea un nuevo auto (solo para administradores).
 */
  createCar(carData: {
    brand: string;
    model: string;
    year: number;
    color: string;
    pricePerDay: number;
    location: string;
    power: number;
    imageUrl: string;
    systemId: string;
    companionTypeId: string;
  }): Observable<any> {
    if (!this.isAdmin()) {
      alert('Solo los administradores pueden crear autos.');
      return throwError(() => new Error('Acceso no autorizado'));
    }

    const headers = this.getAuthHeaders();
    return this.http.post(`${this.API_URL}createCar`, carData, { headers })
      .pipe(
        tap(() => this.carsCache = null),
        catchError(this.handleError)
      );
  }


  /**
   * Gets cars for admin and client (using role-based logic).
   * Implements a Proxy Pattern to reduce redundant API calls.
   */
  listCarsAdminClient(): Observable<any> {
    const headers = this.getAuthHeaders();

    if (this.carsCache) {
      return of(this.carsCache);
    }

    return this.http.get<any>(`${this.API_URL}listCarsAdminClient`, { headers }).pipe(
      tap((response) => {
        this.carsCache = response.data || response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Elimina un auto por ID (solo para administradores)
   */
  deleteCar(carId: string): Observable<any> {
    if (!this.isAdmin()) {
      alert('Solo los administradores pueden eliminar autos.');
      return throwError(() => new Error('Acceso no autorizado'));
    }

    if (!carId) {
      return throwError(() => new Error('ID del auto es requerido'));
    }

    const headers = this.getAuthHeaders();

    return this.http.delete(`${this.API_URL}DeleteCar/${carId}`, { headers }).pipe(
      tap(() => {
        this.carsCache = null;
      }),
      catchError(this.handleError)
    );
  }

}
