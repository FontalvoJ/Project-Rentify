import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

// DTOs
import { CreateReviewDTO } from '../../models/review/create-review.dto';
import { Review } from '../../models/review/review.dto';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private readonly API_URL = `${environment.api.baseUrl}/reservations/`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * 🔐 Headers con token JWT
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  /**
   * ⚠️ Manejo centralizado de errores
   */
  private handleError(error: any): Observable<never> {
    return throwError(() => error);
  }

  /**
   * ⭐ Crear reseña
   */
  createReview(data: CreateReviewDTO): Observable<Review> {

    const headers = this.getAuthHeaders();

    return this.http.post<{ data: Review }>(
      `${this.API_URL}createReview`,
      data,
      { headers }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  getReviewsByCar(carId: string) {
    return this.http.get<any>(
      `${this.API_URL}reviews/${carId}`
    );
  }
}