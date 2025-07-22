import { Component, OnInit } from '@angular/core';
import { ReservationsService } from 'src/app/services/reservation/reservations.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-all-reservations',
  templateUrl: './all-reservations.component.html',
  styleUrls: ['./all-reservations.component.css']
})
export class AllReservationsComponent implements OnInit {
  reservations: any[] = [];
  errorMessage: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  Math = Math;
  showModal = false;
  reservationIdToUpdate: string | null = null;
  newStatus = '';
  updateForm!: FormGroup;
  showError: boolean = false; 

  constructor(private reservationsService: ReservationsService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loadAllReservations();
    this.initializeForm();
  }

  private initializeForm() {
    this.updateForm = this.fb.group({
      status: ['']
    });
  }
  loadAllReservations(): void {
    this.reservationsService.getAllReservations().subscribe({
      next: (data) => {
        //console.log('Reservations data received:', data);
        this.reservations = data;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.errorMessage =
          error?.message || 'There was an error loading reservations. Please try again later.';
      },
      complete: () => { }
    });
  }


  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
  }

  getPages(): number[] {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  totalPages(): number {
    return Math.ceil(this.reservations.length / this.itemsPerPage);
  }

  getPageItems(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.reservations.slice(start, end);
  }

  editReservation(idReservation: string) {
    this.reservationIdToUpdate = idReservation;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.reservationIdToUpdate = null;
    this.newStatus = '';
    this.showError = false;
  }

  updateStatus() {
    if (this.reservationIdToUpdate && this.newStatus) {
      this.reservationsService.updateReservationStatus(this.reservationIdToUpdate, this.newStatus).subscribe(
        updatedReservation => {
          console.log('Updated reservation:', updatedReservation);
          this.loadAllReservations();
          this.closeModal();
        },
        error => {
          console.error('Error updating reservation status:', error);
        }
      );
    } else {
      this.showError = true;
    }
  }
}
