
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarClientComponent } from "../../../layouts/navbar-client/navbar-client.component";
import { UpdateInfoComponent } from "../update-info/update-info.component";
import { ReservationService } from '../../../services/reservations/reservation.service';
import { ReviewService } from '../../../services/review/review.service';
import { Reservation } from '../../../models/reservations/reservation.dto';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-reservations',
  imports: [CommonModule, NavbarClientComponent, UpdateInfoComponent, FormsModule],
  templateUrl: './dashboard-client.component.html',
  styleUrl: './dashboard-client.component.css'
})
export class DashboardClientComponent implements OnInit {

  reservations: Reservation[] = [];
  paginatedReservations: Reservation[] = [];
  reviews: any[] = [];

  loading = true;
  errorMessage: string | null = null;

  currentPage = 1;
  itemsPerPage = 10;
  Math = Math;

  selectedReservationId: string | null = null;
  rating: number = 0;
  comment: string = '';
  showReviewModal: boolean = false;
  showSuccessToast: boolean = false;
  showAlreadyReviewedToast: boolean = false;



  constructor(private reservationService: ReservationService, private reviewService: ReviewService) { }

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.errorMessage = null;

    this.reservationService.getReservations().subscribe({
      next: (data) => {
        //console.log('RESERVAS:', data);
        this.reservations = data;
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


  canReview(res: Reservation): boolean {
    return res.status === 'Completada';
  }


  openReviewModal(reservationId: string): void {
    this.selectedReservationId = reservationId;
    this.rating = 0;
    this.comment = '';
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.selectedReservationId = null;
  }

  submitReview(): void {

    if (!this.selectedReservationId) return;

    if (this.rating === 0) {
      this.errorMessage = 'Debes seleccionar una calificación';
      return;
    }

    if (!this.comment.trim()) {
      this.errorMessage = 'El comentario no puede estar vacío';
      return;
    }

    const data = {
      reservationId: this.selectedReservationId,
      rating: this.rating,
      comment: this.comment
    };

    this.reviewService.createReview(data).subscribe({
      next: () => {
        this.showSuccessToast = true;

        setTimeout(() => {
          this.showSuccessToast = false;
        }, 3000);
        this.closeReviewModal();
        this.loadReservations();
      },
      error: (err) => {
        //console.log('ERROR COMPLETO:', err);
        const message = err?.error?.message;

        if (message === 'Ya existe una reseña para esta reserva') {
          this.showAlreadyReviewedToast = true;

          setTimeout(() => {
            this.showAlreadyReviewedToast = false;
          }, 3000);
        } else {
          this.errorMessage = message || 'Error al enviar reseña';
        }
      }
    });
  }

  loadReviews(carId: string) {
    this.reviewService.getReviewsByCar(carId).subscribe({
      next: (res) => {
        this.reviews = res.data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


}