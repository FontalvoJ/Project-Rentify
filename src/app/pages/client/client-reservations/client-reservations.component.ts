import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarClientComponent } from "../../../layouts/navbar-client/navbar-client.component";
import { UpdateInfoComponent } from "../update-info/update-info.component";
import { ReservationService } from '../../../services/reservations/reservation.service';
import { Reservation } from '../../../models/reservations/reservation.dto';

@Component({
  selector: 'app-client-reservations',
  imports: [CommonModule, NavbarClientComponent, UpdateInfoComponent],
  templateUrl: './client-reservations.component.html',
  styleUrl: './client-reservations.component.css'
})
export class ClientReservationsComponent implements OnInit {

  reservations: Reservation[] = [];
  paginatedReservations: Reservation[] = [];

  loading = true;
  errorMessage: string | null = null;

  currentPage = 1;
  itemsPerPage = 10;
  Math = Math;

  constructor(private reservationService: ReservationService) { }

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.errorMessage = null;

    this.reservationService.getReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.currentPage = 1;
        this.updatePagination();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar las reservas';
        this.loading = false;
      }
    });
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedReservations = this.reservations.slice(start, end);
  }

  totalPages(): number {
    return Math.ceil(this.reservations.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
    this.updatePagination();
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }
}