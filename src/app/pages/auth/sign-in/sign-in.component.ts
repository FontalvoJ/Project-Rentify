import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarHomeComponent } from "../../../layouts/navbar-home/navbar-home.component";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule, NavbarHomeComponent, CommonModule],
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
  attempts = 0;
  maxAttempts = 3;
  blocked = false;

  countdown = 30;
  private countdownInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }


  resetLoginState(): void {
    this.attempts = 0;
    this.blocked = false;
    this.errorMessage = '';
  }

  handleFailedAttempt(): void {
    this.attempts++;
    const remaining = this.maxAttempts - this.attempts;

    if (remaining > 0) {
      this.errorMessage = `Correo o contraseña incorrectos. Te queda${remaining === 1 ? '' : 'n'} ${remaining} intento${remaining === 1 ? '' : 's'}.`;
    } else {
      this.startBlockCountdown();
    }
  }

  startBlockCountdown(): void {
    this.blocked = true;
    this.countdown = 30;
    this.errorMessage = `Demasiados intentos fallidos. Podrás intentarlo de nuevo en ${this.countdown}s.`;

    this.countdownInterval = setInterval(() => {
      this.countdown--;

      if (this.countdown > 0) {
        this.errorMessage = `Demasiados intentos fallidos. Podrás intentarlo de nuevo en ${this.countdown}s.`;
      } else {
        clearInterval(this.countdownInterval);
        this.resetLoginState();
      }
    }, 1000);
  }

  signIn(): void {

    if (this.blocked) {
      this.errorMessage = 'Has superado el número máximo de intentos. Intenta más tarde.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.signIn(this.credentials)
      .subscribe({
        next: (success) => {
          this.loading = false;

          if (success) {
            this.attempts = 0;
            this.navigateBasedOnRole();
          } else {
            this.handleFailedAttempt();
          }
        },
        error: (error) => {
          this.loading = false;
          this.handleFailedAttempt();
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