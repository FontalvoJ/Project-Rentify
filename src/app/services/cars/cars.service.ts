import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { map } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { CarData } from '../../models/cars/car-data';
import { CreateCarData } from '../../models/cars/create-car-data';

@Injectable({
  providedIn: 'root'
})
export class CarService {

  private API_URL = 'https://api-backend-rentify.onrender.com/api/cars/';
  private carsCache: CarData[] | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Obtiene todos los autos disponibles para cualquier usuario
   * (endpoint público, no requiere autenticación).
   */
  getAllCarsForEveryone(): Observable<CarData[]> {

    return this.http
      .get<{ message: string; data: CarData[] }>(
        `${this.API_URL}allCars`
      )
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Limpia la caché local de autos.
   * Se utiliza cuando se crea, elimina o actualiza un auto.
   */
  clearCache(): void {
    this.carsCache = null;
  }

  /**
   * Genera los headers de autenticación utilizando el token
   * almacenado en la sesión del usuario.
   */
  private getAuthHeaders(): HttpHeaders {

    const token = this.authService.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

  }

  /**
   * Verifica si el usuario actual tiene rol de administrador.
   */
  private isAdmin(): boolean {
    return this.authService.getUserRole() === 'admin';
  }

  /**
   * Manejo genérico de errores para las peticiones HTTP.
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en la petición HTTP:', error);
    alert('Ocurrió un error en la operación. Inténtelo nuevamente.');
    return throwError(() => error);
  }

  /**
   * Crea un nuevo auto.
   * Solo puede ser ejecutado por usuarios con rol administrador.
   */
  createCar(carData: CreateCarData): Observable<CarData> {

    if (!this.isAdmin()) {
      alert('Solo los administradores pueden crear autos.');
      return throwError(() => new Error('Acceso no autorizado'));
    }

    const headers = this.getAuthHeaders();

    return this.http.post<CarData>(`${this.API_URL}createCar`, carData, { headers })
      .pipe(
        tap(() => {
          this.clearCache();
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene la lista de autos para administradores y clientes.
   * Implementa el patrón Proxy utilizando una caché local
   * para evitar llamadas repetidas al servidor.
   */
  listCarsAdminClient(): Observable<CarData[]> {

    const headers = this.getAuthHeaders();

    return this.http
      .get<{ message: string; data: CarData[] }>(
        `${this.API_URL}listCarsAdminClient`,
        { headers }
      )
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Elimina un auto por su ID.
   * Solo los administradores pueden realizar esta operación.
   */
  deleteCar(carId: string): Observable<any> {

    if (!this.isAdmin()) {
      alert('Solo los administradores pueden eliminar autos.');
      return throwError(() => new Error('Acceso no autorizado'));
    }

    if (!carId) {
      return throwError(() => new Error('El ID del auto es obligatorio'));
    }

    const headers = this.getAuthHeaders();

    return this.http.delete(`${this.API_URL}DeleteCar/${carId}`, { headers })
      .pipe(
        tap(() => {
          this.clearCache();
        }),
        catchError(this.handleError)
      );
  }

}