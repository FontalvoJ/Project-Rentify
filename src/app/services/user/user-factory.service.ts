import { Injectable } from '@angular/core';
import { AdminUser, ClientUser } from '../../models/user/user-data';
import { RegisterFormData } from '../../models/user/register-form-data';

@Injectable({
  providedIn: 'root'
})
export class UserFactoryService {

  createUser(data: RegisterFormData): AdminUser | ClientUser {
    if (data.role === 'admin') {
      return new AdminUser(
        data.name,
        data.email,
        data.password
      );
    } else {
      return new ClientUser(
        data.name,
        data.email,
        data.password,
        data.identification,
        data.address,
        data.contact
      );
    }
  }
}