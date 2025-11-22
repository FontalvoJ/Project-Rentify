import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { DetailsCardsComponent } from '../details-cards/details-cards.component';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent implements AfterViewInit {
 
  @ViewChild(DetailsCardsComponent)
  detailsCards!: DetailsCardsComponent;

  // 🚀 Se llama cuando el hijo ya existe en el DOM
  ngAfterViewInit(): void {
    this.detailsCards.fetchCars();
  }

  // 🚗 Cuando se crea un auto desde el modal
  onCarCreated() {
    this.detailsCards.fetchCars();
  }

}
