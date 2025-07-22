import { Component, OnInit } from '@angular/core';
import { ReservationsService } from 'src/app/services/reservation/reservations.service';

@Component({
  selector: 'app-client-reservations',
  templateUrl: './client-reservations.component.html',
  styleUrls: ['./client-reservations.component.css']
})
export class ClientReservationsComponent implements OnInit {
  Math = Math;
  activeReservations: any[] = [];
  errorMessage: string | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(private reservationsService: ReservationsService) { }

  ngOnInit(): void {
    this.getActiveReservations();
  }

  getActiveReservations(): void {
    this.reservationsService.getUserActiveReservations().subscribe({
      next: (reservations) => {
        //console.log('Datos recibidos del backend:', reservations); // Verifica los datos en consola

        if (!reservations || reservations.length === 0) {
          console.warn('No active reservations found.');
          this.activeReservations = [];
          this.errorMessage = 'No active reservations found.';
          return;
        }

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;

        this.activeReservations = reservations.slice(start, end);
        this.errorMessage = null;

        //console.log('Reservas activas paginadas:', this.activeReservations); 
      },
      error: (error) => {
        console.error('Error fetching active reservations:', error);
        this.errorMessage = 'Failed to load reservations. Please try again later.';
      }
    });
  }


  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
    this.getActiveReservations();
  }

  totalPages(): number {
    return Math.ceil(this.activeReservations.length / this.itemsPerPage);
  }

  getPages(): number[] {
    const totalPages = this.totalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
}
