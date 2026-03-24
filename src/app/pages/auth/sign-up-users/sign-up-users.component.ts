import { Component, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize } from 'rxjs';
import { RegistrationService } from '../../../services/user/registration.service';
import { NavbarHomeComponent } from "../../../layouts/navbar-home/navbar-home.component";

@Component({
  selector: 'app-sign-up-users',
  imports: [ReactiveFormsModule, CommonModule, NavbarHomeComponent],
  templateUrl: './sign-up-users.component.html',
  styleUrls: ['./sign-up-users.component.css'],
})
export class SignUpUsersComponent implements OnDestroy {


  // Propiedades del componente

  formRegister: FormGroup;
  isRegisterModalOpen = false;
  isLoading = false;
  errorMessage = '';
  showSuccessCreateUser = false;

  private destroy$ = new Subject<void>();
  private alertTimeout: any;

  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationService
  ) {
    this.formRegister = this.initForm();
    this.setupRoleBasedValidators();
  }


  // Inicialización del formulario

  private initForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      identification: [''],
      address: [''],
      contact: ['']
    });
  }

  private setupRoleBasedValidators(): void {
    const clientFields = ['identification', 'address', 'contact'];

    this.formRegister.get('role')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((role: string) => {
        clientFields.forEach(field => {
          const control = this.formRegister.get(field);
          if (!control) return;

          if (role === 'client') {
            control.setValidators([Validators.required]);
          } else {
            control.clearValidators();
          }
          control.updateValueAndValidity();
        });
      });
  }


  // Manejo de envío del formulario

  onSubmit(): void {
    if (this.formRegister.invalid) {
      this.formRegister.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos requeridos.';
      return;
    }

    this.isLoading = true;
    this.registrationService.registerUser(this.formRegister.value)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
  }


  // Métodos privados de UI

  private handleSuccess(): void {
    this.showSuccessCreateUser = true;
    clearTimeout(this.alertTimeout);


    this.alertTimeout = setTimeout(() => {
      this.showSuccessCreateUser = false;
      this.closeModal();
    }, 2000);
  }

  private handleError(error: any): void {
    this.errorMessage = error?.message || 'Error al procesar el formulario.';
  }

  private resetForm(): void {
    this.formRegister.reset({ role: 'admin' });
    this.errorMessage = '';
    this.showSuccessCreateUser = false;
  }


  // Manejo del modal

  closeModal(): void {
    this.isRegisterModalOpen = false;
    this.resetForm();
  }


  // Lifecycle hooks

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.alertTimeout);
  }
}