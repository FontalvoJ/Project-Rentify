import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { AdminUser, ClientUser } from '../../models/user/user-data';
import { SessionService } from './session.service';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly AUTH_API_URL = `${environment.api.baseUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private session: SessionService
  ) { }

  signIn(user: { email: string; password: string }): Observable<boolean> {
    return this.http.post<{ token: string; role: string; name: string }>(
      `${this.AUTH_API_URL}/signInUsers`,
      user
    ).pipe(
      tap(res => this.session.setSession(res.token, res.name, res.role)),
      map(() => true),
      catchError(err => {
        console.error('Error en login:', err);
        return of(false);
      })
    );
  }

  signUpAdmin(user: AdminUser): Observable<boolean> {
    return this.http.post<{ token: string; role: string; name: string }>(
      `${this.AUTH_API_URL}/signUpAdmin`,
      user
    ).pipe(
      tap(res => this.session.setSession(res.token, res.name, res.role)),
      map(() => true),
      catchError(err => {
        console.error('Error en registro admin:', err);
        return of(false);
      })
    );
  }

  signUpClient(user: ClientUser): Observable<boolean> {
    return this.http.post<{ token: string; role: string; name: string }>(
      `${this.AUTH_API_URL}/signUpClient`,
      user
    ).pipe(
      tap(res => this.session.setSession(res.token, res.name, res.role)),
      map(() => true),
      catchError(err => {
        console.error('Error en registro cliente:', err);
        return of(false);
      })
    );
  }

  logout(): void {
    this.session.clearSession();
    this.router.navigateByUrl('/home', { skipLocationChange: true });
  }

  isLoggedIn(): boolean {
    return this.session.isLoggedIn();
  }

  getToken(): string | null {
    return this.session.getToken();
  }

  getUserName(): string | null {
    return this.session.getName();
  }

  getUserRole(): string | null {
    return this.session.getRole();
  }
}