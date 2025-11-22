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
  showSuccessCreateUser = false;
  private alertTimeout: any;

  constructor(
    private fb: FormBuilder,
    private userFactory: UserFactoryService,
    private authService: AuthService,
    private router: Router
  ) {
    this.formRegister = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],

      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^[0-9]+$/)
      ]],

      role: ['', Validators.required],

      identification: ['', [
        Validators.pattern(/^[0-9]+$/)
      ]],

      address: [''],

      contact: ['', [
        Validators.pattern(/^(\+?\d{1,3}[- ]?)?\d{7,15}$/)
      ]]
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
    this.isRegisterModalOpen = true;
    this.errorMessage = '';

  }

  closeModal(): void {
    this.isRegisterModalOpen = false;


    setTimeout(() => {
      this.formRegister.reset();
      this.errorMessage = '';
      this.formRegister.get('role')?.setValue('admin');
    });
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
          this.showSuccessCreateUser = true;


          clearTimeout(this.alertTimeout);
          this.alertTimeout = setTimeout(() => {
            this.showSuccessCreateUser = false;
          }, 3000);

          this.closeModal();
        },
      });
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al procesar el formulario.';
      this.isLoading = false;
    }
  }
}