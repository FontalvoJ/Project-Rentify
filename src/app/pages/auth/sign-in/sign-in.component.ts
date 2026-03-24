import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarHomeComponent } from "../../../layouts/navbar-home/navbar-home.component";


@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule, NavbarHomeComponent],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  credentials = {
    email: '',
    password: ''
  };

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  signIn(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.signIn(this.credentials)
      .subscribe({
        next: (success) => {
          this.loading = false;

          if (success) {
            this.navigateBasedOnRole();
          } else {
            this.errorMessage = 'Usuario o contraseña incorrectos.';
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error?.error?.message || 'Ocurrió un error, intente nuevamente.';
          console.error('Error en login:', error);
        }
      });
  }

  private navigateBasedOnRole(): void {
    const role = this.authService.getUserRole();

    switch (role) {
      case 'admin':
        this.router.navigate(['/dashboard-admin']);
        break;
      case 'client':
        this.router.navigate(['/dashboard-client']);
        break;
      default:
        this.router.navigate(['/home']);
        break;
    }
  }
}