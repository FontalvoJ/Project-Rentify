import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClientService } from 'src/app/services/client/client.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-update-info',
  templateUrl: './update-info.component.html',
  styleUrls: ['./update-info.component.css']
})
export class UpdateInfoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  clientData = {
    name: '',
    identification: '',
    address: '',
    contact: '',
    email: '',
    password: ''
  };

  uiState = {
    isModalOpenEditProfile: false,
    dropdownOpen: false,
    showAlertUpdateInfo: false,
    isModalOpenDeleteAccount: false,
    isLoading: false
  };

  constructor(private clientService: ClientService, private router: Router) { }

  ngOnInit(): void {
    this.getClientData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDropdown() {
    this.uiState.dropdownOpen = !this.uiState.dropdownOpen;
  }

  getClientData() {
    this.uiState.isLoading = true;
    this.clientService.getClientInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.clientData = {
            name: response.user.name,
            email: response.user.email,
            identification: response.client.identification,
            address: response.client.address,
            contact: response.client.contact,
            password: ''
          };
          this.uiState.isLoading = false;
        },
        (error) => {
          console.error('Error retrieving client data', error);
          this.uiState.isLoading = false;
        }
      );
  }

  updateClientInfo() {
    console.log('Datos que se envían al backend:', this.clientData);

    this.clientService.updateClientInfo(this.clientData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          console.log('Respuesta del backend:', response);
          this.uiState.showAlertUpdateInfo = true;
          this.closeModalEdit();
          setTimeout(() => this.uiState.showAlertUpdateInfo = false, 3000);
        },
        (error) => console.error('Error updating client data', error)
      );
  }

  deleteAccount() {
    this.clientService.deleteClientAccount()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => this.router.navigate(['/home']),
        (error) => console.error('Error deleting account:', error)
      );
  }

  openModalEdit() {
    this.uiState.isModalOpenEditProfile = true;
    this.toggleDropdown();
  }

  closeModalEdit() {
    this.uiState.isModalOpenEditProfile = false;
  }

  openDeleteAccountModal() {
    this.uiState.isModalOpenDeleteAccount = true;
  }

  closeDeleteAccountModal() {
    this.uiState.isModalOpenDeleteAccount = false;
  }
}
