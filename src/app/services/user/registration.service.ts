import { Injectable } from '@angular/core';
import { UserFactoryService } from './user-factory.service';
import { AuthService } from '../auth/auth.service';
import { Observable, throwError } from 'rxjs';
import { RegisterFormData } from '../../models/user/register-form-data';
import { AdminUser, ClientUser } from '../../models/user/user-data';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  constructor(
    private userFactory: UserFactoryService,
    private authService: AuthService
  ) { }

  registerUser(data: RegisterFormData): Observable<any> {
    if (data.role !== 'admin' && data.role !== 'client') {
      return throwError(() => new Error(`Rol inválido: ${data.role}`));
    }

    const user = this.userFactory.createUser(data);

    return data.role === 'admin'
      ? this.authService.signUpAdmin(user as AdminUser)
      : this.authService.signUpClient(user as ClientUser);
  }
}