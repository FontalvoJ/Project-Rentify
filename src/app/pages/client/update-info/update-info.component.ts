import { Component, OnInit } from '@angular/core';
import { ClientService } from 'src/app/services/client/client.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-update-info',
  templateUrl: './update-info.component.html',
  styleUrls: ['./update-info.component.css']
})
export class UpdateInfoComponent implements OnInit {
  isModalOpenEditProfile = false;
  dropdownOpen = false;
  clientData = {
    name: '',
    identification: '',
    address: '',
    contact: '',
    email: '',
    password: ''
  };
  showAlertUpdateInfo = false;
  isModalOpenDeleteAccount = false;

  constructor(private clientService: ClientService, private router: Router) { }

  ngOnInit(): void {
    this.getClientData();
  }


  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }


  getClientData() {
    this.clientService.getClientInfo().subscribe(
      (response) => {
        //console.log('Client data retrieved successfully', response);
        this.clientData = response.client;
      },
      (error) => {
        console.error('Error retrieving client data', error);
      }
    );
  }


  openModalEdit() {
    this.isModalOpenEditProfile = true;
    this.toggleDropdown();
  }


  closeModalEdit() {
    this.isModalOpenEditProfile = false;
  }


  updateClientInfo() {
    this.clientService.updateClientInfo(this.clientData).subscribe(
      (response) => {
        //console.log('Client data updated successfully', response);
        this.showAlertUpdateInfo = true;
        this.closeModalEdit();

        setTimeout(() => {
          this.showAlertUpdateInfo = false;
        }, 3000);
      },
      (error) => {
        console.error('Error updating client data', error);
      }
    );
  }


  openDeleteAccountModal() {
    this.isModalOpenDeleteAccount = true;
  }


  closeDeleteAccountModal() {
    this.isModalOpenDeleteAccount = false;
  }

  
  deleteAccount() {
    this.clientService.deleteClientAccount().subscribe(
      (response) => {

        this.router.navigate(['/home']);
      },
      (error) => {

        console.error('Error deleting account:', error);
      }
    );
  }

}
