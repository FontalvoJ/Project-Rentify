import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  credentials = {
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  signIn(): void {
    this.authService.signIn(this.credentials)
      .subscribe({
        next: (response) => {
          if (response) {
            this.handleSuccessfulLogin(response);
          } else {
            console.error('Response is null.');
            this.router.navigate(['/home']);
          }
        },
        error: (error) => {
          this.handleLoginError(error);

        }
      });
  }

  private handleSuccessfulLogin(response: { token: string, role: string, name?: string }): void {
    if (!response?.token) {
      console.error('Invalid token or user response.');
      this.router.navigate(['/home']);
      return;
    }

    localStorage.setItem('token', response.token);

    if (response.name) {
      localStorage.setItem('userName', response.name);
    }

    if (!response.role) {
      console.error('User role is not defined.');
      this.router.navigate(['/home']);
      return;
    }

    localStorage.setItem('role', response.role);
    this.navigateBasedOnRole(response.role);
  }

  private handleLoginError(error: any): void {
    console.log(error);
    alert('Error logging in: ' + (error.error?.message || 'Please try again later.'));
  }

  private navigateBasedOnRole(role: string): void {
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