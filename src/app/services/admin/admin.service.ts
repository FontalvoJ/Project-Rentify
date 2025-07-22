import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private API_URL = 'https://api-node-rentify.onrender.com/api/cars/';

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
  * Creates a new car (for admins only).
  */
  createCar(carData: {
    brand: string;
    model: string;
    year: number;
    color: string;
    pricePerDay: number;
    location: string;
    power: number;
    system: string;
    accompanists: number;
    imageUrl: string;
  }): Observable<any> {
    if (!this.isAdmin()) {
      alert('Only admins can create cars.');
      return throwError(() => new Error('Unauthorized access'));
    }

    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.API_URL}createCar`, carData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
  * Gets all cars registered by an administrator.
  */
  getAllCarsByAdmin(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}carsByAdmin`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
* Gets the cars available for an authenticated user.
*/
  getCarsForAuthenticatedUser(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}allCars/authenticated`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
* Delete a car by its ID (for admins only).
*/
  deleteCar(carId: string): Observable<any> {
    if (!this.isAdmin()) {
      alert('Only admins can delete cars.');
      return throwError(() => new Error('Unauthorized access'));
    }

    const headers = this.getAuthHeaders();
    const url = `${this.API_URL}deleteCar/${carId}`;

    console.log('DELETE request URL:', url);

    return this.http.delete<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
* Updates the details of a car by its ID (for admins only).
*/
  updateCar(carId: string, carData: {
    brand?: string;
    model?: string;
    year?: number;
    color?: string;
    pricePerDay?: number;
    location?: string;
    availability?: boolean;
    createdBy?: string;
    power?: number;
    system?: string;
    accompanists?: number;
  }): Observable<any> {
    if (!this.isAdmin()) {
      alert('Only admins can update cars.');
      return throwError(() => new Error('Unauthorized access'));
    }

    const headers = this.getAuthHeaders();
    const url = `${this.API_URL}updateCar/${carId}`;

    return this.http.put<any>(url, carData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

}
