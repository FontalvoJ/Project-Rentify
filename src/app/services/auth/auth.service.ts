import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AdminUser, ClientUser } from '../auth/user-factory.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private AUTH_API_URL = 'http://localhost:3030/api/auth';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }


  /**
  * Logs in a user by sending their credentials to the server.
  */
  signIn(user: { email: string; password: string; }) {
    return this.http.post<{ token: string, role: string, id: string, name: string }>(
      `${this.AUTH_API_URL}/signInUsers`,
      user
    ).pipe(
      tap((response) => {

        localStorage.setItem('token', response.token);
        localStorage.setItem('userName', response.name);
        localStorage.setItem('role', response.role);
      }),
      catchError(error => {
        console.error("Error en inicio de sesión:", error);
        return of(null);
      })
    );
  }

  /**
 * Creates a new admin user by sending their credentials to the server.
 */
  signUpAdmin(user: AdminUser) {
    return this.http.post<{ token: string; role: string; name: string }>(
      `${this.AUTH_API_URL}/signUpAdmin`,
      user
    ).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userName', res.name);
        localStorage.setItem('role', res.role);
      }),
      catchError(error => {
        console.error('Error en registro admin:', error);
        return of(null);
      })
    );
  }

  /**
  * Creates a new client user by sending their credentials to the server.
  */
  signUpClient(user: ClientUser) {
    return this.http.post<{ token: string; role: string; name: string }>(
      `${this.AUTH_API_URL}/signUpClient`,
      user
    ).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userName', res.name);
        localStorage.setItem('role', res.role);
      }),
      catchError(error => {
        console.error('Error en registro cliente:', error);
        return of(null);
      })
    );
  }



  loggedIn(): boolean {
    return !!localStorage.getItem('token');
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserName(): string | null {
    return localStorage.getItem('userName');
  }

  getUserRole(): string | null {
    return localStorage.getItem('role');
  }


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    this.router.navigateByUrl('/home', { skipLocationChange: true });
  }
}
