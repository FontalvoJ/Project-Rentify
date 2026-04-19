import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../../services/reservations/reservation.service';
import { Reservation } from '../../../models/reservations/reservation.dto';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarAdminComponent } from "../../../layouts/navbar-admin/navbar-admin.component";

@Component({
  selector: 'app-all-reservations',
  imports: [CommonModule, RouterModule, FormsModule, NavbarAdminComponent],
  templateUrl: './all-reservations.component.html',
  styleUrl: './all-reservations.component.css'
})
export class AllReservationsComponent implements OnInit {

  reservations: Reservation[] = [];
  paginatedReservations: Reservation[] = [];

  loading = true;
  updating = false;
  errorMessage: string | null = null;

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  Math = Math;

  // Modal
  showModal = false;
  showError = false;
  selectedReservationId: string | null = null;
  newStatus = '';

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
        this.errorMessage = 'Error al cargar reservas';
        this.loading = false;
      }
    });
  }

  // ─── Paginación ───────────────────────────────────────────

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

  // ─── Modal ────────────────────────────────────────────────

  editReservation(reservationId: string): void {
    this.selectedReservationId = reservationId;
    this.newStatus = '';
    this.showError = false;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedReservationId = null;
    this.newStatus = '';
    this.showError = false;
  }

  updateStatus(): void {
    if (!this.newStatus) {
      this.showError = true;
      return;
    }

    if (!this.selectedReservationId) return;

    this.updating = true;
    this.showError = false;

    this.reservationService
      .updateReservationStatus(this.selectedReservationId, this.newStatus)
      .subscribe({
        next: () => {
          // Actualiza localmente sin recargar toda la lista
          const reservation = this.reservations.find(
            r => r.id === this.selectedReservationId
          );
          if (reservation) {
            reservation.status = this.newStatus;
            this.updatePagination();
          }
          this.updating = false;
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Error al actualizar estado';
          this.updating = false;
          this.closeModal();
        }
      });
  }

  registerPayment(reservationId: string): void {

    if (!reservationId) return;

    this.updating = true;

    this.reservationService.registerPayment(reservationId).subscribe({
      next: () => {

        // actualizar localmente
        const reservation = this.reservations.find(r => r.id === reservationId);

        if (reservation) {
          reservation.paymentStatus = 'Pagado';
        }

        this.updatePagination();
        this.updating = false;

      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Error al registrar pago';
        this.updating = false;
      }
    });
  }

  canPay(res: Reservation): boolean {
    return res.paymentStatus === 'Pendiente';
  }

  canActivate(res: Reservation): boolean {
    return res.paymentStatus === 'Pagado' && res.status === 'Pendiente';
  }
}