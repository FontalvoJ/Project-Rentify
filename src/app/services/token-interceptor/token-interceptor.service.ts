import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

@Injectable(
)
export class TokenInterceptorService implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtiene el token de autenticación
    const token = this.authService.getToken();

    // Clona la solicitud y agrega el encabezado de autorización si hay un token
    if (token) {
      const tokenizeReq = req.clone({
        setHeaders: {
          Authorization: `Authorization ${token}`
        }
      });
      return next.handle(tokenizeReq);
    }

    // Si no hay token, solo continua con la solicitud original
    return next.handle(req);
  }
}
