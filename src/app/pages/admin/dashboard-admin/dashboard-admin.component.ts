import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { NavbarAdminComponent } from "../../../layouts/navbar-admin/navbar-admin.component";
import { ListCarsReservationsComponent } from "../list-cars-reservations/list-cars-reservations.component";
import { DetailsCardsComponent } from "../details-cards/details-cards.component";
import { Reservation } from '../../../models/reservations/reservation.dto';
import { ReservationService } from '../../../services/reservations/reservation.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [
    NavbarAdminComponent,
    ListCarsReservationsComponent,
    DetailsCardsComponent
  ],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css'
})
export class DashboardAdminComponent implements OnInit, AfterViewInit {

  @ViewChild(DetailsCardsComponent)
  detailsCards!: DetailsCardsComponent;

  reservations: Reservation[] = [];
  totalRevenue: number = 0;

  metrics = {
    active: 0,
    completed: 0,
    cancelled: 0,
    pending: 0
  };

  constructor(private reservationService: ReservationService) { }

  ngOnInit(): void {
    // console.log('🔥 Dashboard iniciado');
    this.loadReservations();
  }


  ngAfterViewInit(): void {
    if (this.detailsCards) {
      this.detailsCards.fetchCars();
    }
  }


  onCarCreated(): void {
    if (this.detailsCards) {
      this.detailsCards.fetchCars();
    }
  }

  loadReservations(): void {
    this.reservationService.getReservations().subscribe({
      next: (data) => {
        // console.log('📦 RESERVAS:', data);

        this.reservations = data;

        // this.reservations.forEach(r => {
        //   console.log('STATUS:', r.status);
        // });

        this.calculateMetrics();
        this.calculateRevenue();
      },
      error: (err) => {
        // console.error('❌ ERROR:', err);
      }
    });
  }

  calculateMetrics(): void {

    this.metrics = {
      active: 0,
      completed: 0,
      cancelled: 0,
      pending: 0
    };

    this.reservations.forEach(r => {
      const status = (r.status || '').toLowerCase().trim();

      if (['activa', 'active'].includes(status)) this.metrics.active++;
      else if (['completada', 'completed'].includes(status)) this.metrics.completed++;
      else if (['cancelada', 'cancelled'].includes(status)) this.metrics.cancelled++;
      else if (['pendiente', 'pending'].includes(status)) this.metrics.pending++;
    });

    // console.log('📊 MÉTRICAS:', this.metrics);
  }

  calculateRevenue(): void {
    this.totalRevenue = this.reservations
      .filter(r => {
        const status = (r.status || '').toLowerCase();
        return status === 'completada' || status === 'completed';
      })
      .reduce((total, r) => total + (r.totalCost || 0), 0);
  }
}