import { Component, OnInit } from '@angular/core';
import { CarService } from 'src/app/services/admin/admin.service';
import { ReservationsService } from 'src/app/services/reservation/reservations.service';

@Component({
  selector: 'app-cars-reservation',
  templateUrl: './cars-reservation.component.html',
  styleUrls: ['./cars-reservation.component.css']
})
export class CarsReservationComponent implements OnInit {
  cars: any[] = [];
  errorMessage: string = '';
  selectedCar: any = null;
  showModal: boolean = false;
  startDate: string = '';
  endDate: string = '';
  totalDays: number = 0;
  finalPrice: number = 0;
  priceTotal: number = 0;
  discountApplied: boolean = false;
  discountPercentage: number = 0;
  showAlert: boolean = false;
  showAlertReservationActive: boolean = false;
  alertMessage: string = '';

  constructor(private carService: CarService, private reservationsService: ReservationsService) { }

  ngOnInit(): void {
    this.loadCars();
  }

  loadCars() {
    this.carService.getCarsForAuthenticatedUser().subscribe(
      data => {
        if (data.cars && data.cars.length > 0) {
          this.cars = data.cars;
        } else {
          this.errorMessage = 'No cars available.';
        }
      },
      error => {
        this.errorMessage = 'Error loading cars. Please try again later.';
        console.error('Error loading cars:', error);
      }
    );
  }

  generateReservation(car: any): void {
    this.selectedCar = car;
    this.showModal = true;
    this.startDate = '';
    this.endDate = '';
    this.totalDays = 0;
    this.priceTotal = 0;
    this.finalPrice = 0;
    this.discountApplied = false;
    this.discountPercentage = 0;
  }

  calculateReservation(): void {
    if (!this.startDate || !this.endDate || !this.selectedCar) {
      this.totalDays = 0;
      this.priceTotal = 0;
      this.discountApplied = false;
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    this.totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    let discountPercentage = 0;
    this.discountApplied = false;

    if (this.totalDays > 20) {
      discountPercentage = 20;
      this.discountApplied = true;
    } else if (this.totalDays > 12) {
      discountPercentage = 10;
      this.discountApplied = true;
    }

    this.discountPercentage = discountPercentage;
    this.priceTotal = this.totalDays * this.selectedCar.pricePerDay;
    this.finalPrice = this.priceTotal - (this.priceTotal * discountPercentage / 100);
  }



  confirmReservation(): void {
    if (!this.startDate || !this.endDate || !this.selectedCar) {
      console.error('You must select both start and end dates.');
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    let discountPercentage = 0;
    let discountApplied = false;

    if (totalDays > 20) {
      discountPercentage = 20;
      discountApplied = true;
    } else if (totalDays > 12) {
      discountPercentage = 10;
      discountApplied = true;
    }



    this.reservationsService.createReservation(
      this.selectedCar._id,
      start,
      end,
      discountApplied,
      discountPercentage
    ).subscribe(
      response => {
        this.showAlert = true;
        this.alertMessage = 'Reservation created successfully!';
        setTimeout(() => { this.showAlert = false; }, 3000);
        this.showModal = false;
      },
      error => {
        console.error('Error creating the reservation:', error);
        this.showAlert = true;
        this.alertMessage = error.error.message || 'An error occurred.';
        setTimeout(() => { this.showAlert = false; }, 3000);
        this.showModal = false;
      }
    );
  }



  closeModal(): void {
    this.showModal = false;
  }
}
