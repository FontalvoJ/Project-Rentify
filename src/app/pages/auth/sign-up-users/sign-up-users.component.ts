import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserFactoryService, AdminUser, ClientUser } from '../../../services/auth/user-factory.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';

@Component({
  selector: 'app-sign-up-users',
  templateUrl: './sign-up-users.component.html',
  styleUrls: ['./sign-up-users.component.css'],
})
export class SignUpUsersComponent {
  private destroy$ = new Subject<void>();
  isRegisterModalOpen = false;
  formRegister: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private userFactory: UserFactoryService,
    private authService: AuthService,
    private router: Router
  ) {
    this.formRegister = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      identification: [''],
      address: [''],
      contact: [''],
    });

    this.formRegister.get('role')?.valueChanges.pipe(

    ).subscribe((role: string) => {
      const clientFields = ['identification', 'address', 'contact'];

      if (role === 'client') {
        clientFields.forEach(field =>
          this.formRegister.get(field)?.setValidators(Validators.required)
        );
      } else {
        clientFields.forEach(field =>
          this.formRegister.get(field)?.clearValidators()
        );
      }

      clientFields.forEach(field =>
        this.formRegister.get(field)?.updateValueAndValidity()
      );
    });
  }



  openRegisterModal(): void {
    this.formRegister.reset();
    this.isRegisterModalOpen = true;
    this.errorMessage = '';
  }

  closeModal(): void {
    this.isRegisterModalOpen = false;
  }
  onSubmit(): void {
    if (this.formRegister.invalid) {
      this.formRegister.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos requeridos.';
      return;
    }

    const role = this.formRegister.get('role')?.value;


    try {
      const user = this.userFactory.createUser(role, this.formRegister.value);

      const request$ =
        role === 'admin'
          ? this.authService.signUpAdmin(user as AdminUser)
          : this.authService.signUpClient(user as ClientUser);

      request$.pipe(
      ).subscribe({
        next: () => {
          this.closeModal();
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Error en el registro.';
        },
      });
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al procesar el formulario.';
      this.isLoading = false;
    }
  }
}