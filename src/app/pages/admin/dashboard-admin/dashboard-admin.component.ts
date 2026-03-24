import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { NavbarAdminComponent } from "../../../layouts/navbar-admin/navbar-admin.component";
import { ListCarsReservationsComponent } from "../list-cars-reservations/list-cars-reservations.component";
import { DetailsCardsComponent } from "../details-cards/details-cards.component";

@Component({
  selector: 'app-dashboard-admin',
  imports: [NavbarAdminComponent, ListCarsReservationsComponent, DetailsCardsComponent],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css'
})
export class DashboardAdminComponent implements AfterViewInit {

  @ViewChild(DetailsCardsComponent)
  detailsCards!: DetailsCardsComponent;

  // Se ejecuta cuando el componente hijo ya está cargado
  ngAfterViewInit(): void {
    this.detailsCards.fetchCars();
  }

  // Cuando se crea un auto desde el modal
  onCarCreated(): void {
    this.detailsCards.fetchCars();
  }
}
