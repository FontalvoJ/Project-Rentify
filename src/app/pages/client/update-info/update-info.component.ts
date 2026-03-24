import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../../../services/user/client.service';
import { UpdateClientData } from '../../../models/client/update-client-data';
import { ClientResponse } from '../../../models/client/client-response';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';


@Component({
  selector: 'app-update-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-info.component.html',
  styleUrl: './update-info.component.css'
})
export class UpdateInfoComponent implements OnInit {

  form!: FormGroup;
  loading = false;

  dropdownOpen = signal(false);
  editModalOpen = signal(false);
  deleteModalOpen = signal(false);
  showAlertUpdateInfo = signal(false);
  showAlertDeleteAccount = signal(false);

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadClientData();
  }

  //Formulario
  initForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      identification: [''],
      address: [''],
      contact: ['']
    });
  }

  //Mapping
  mapToForm(response: ClientResponse): UpdateClientData {
    const data = response.data;

    return {
      name: data.user.name,
      email: data.user.email,
      identification: data.client.identification,
      address: data.client.address,
      contact: data.client.contact
    };
  }

  // Cargar datos
  loadClientData() {
    this.clientService.getClientInfo().subscribe({
      next: (response) => {
        this.form.patchValue(this.mapToForm(response));
      },
      error: (err) => console.error(err)
    });
  }

  // Dropdown
  toggleDropdown() {
    this.dropdownOpen.update(value => !value);
  }

  //Abrir modal editar
  openModalEdit() {
    this.editModalOpen.set(true);
    this.dropdownOpen.set(false);
  }

  // Abrir modal eliminar
  openDeleteAccountModal() {
    this.deleteModalOpen.set(true);
    this.dropdownOpen.set(false);
  }

  //Cerrar modales
  closeModals() {
    this.editModalOpen.set(false);
    this.deleteModalOpen.set(false);
  }

  //Guardar cambios
  onSubmit() {
    if (this.form.invalid || this.loading) return;

    const payload: UpdateClientData = this.form.value;

    this.loading = true;

    this.clientService.updateClientInfo(payload).subscribe({
      next: () => {
        this.loading = false;

        this.closeModals();
        this.showAlertUpdateInfo.set(true);
        setTimeout(() => {
          this.showAlertUpdateInfo.set(false);
        }, 3000);
      },

      error: (err) => {
        console.error('Error al actualizar cliente:', err);
        this.loading = false;
      }
    });
  }

  // Eliminar cuenta
  deleteAccount() {
    this.clientService.deleteClientAccount().subscribe({
      next: () => {
        // 🔹 cerrar modal
        this.deleteModalOpen.set(false);

        // 🔹 mostrar alerta (opcional si no rediriges inmediato)
        this.showAlertDeleteAccount.set(true);

        // 🔹 limpiar sesión + redirigir
        this.authService.logout();
      },

      error: (err) => {
        console.error('Error al eliminar cuenta:', err);
      }
    });
  }
}