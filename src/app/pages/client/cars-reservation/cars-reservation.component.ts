import { Component, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { NavbarClientComponent } from "../../../layouts/navbar-client/navbar-client.component";

import { CarService } from '../../../services/cars/cars.service';
import { CarData } from '../../../models/cars/car-data';
import { ReservationService } from '../../../services/reservations/reservation.service';

import { CreateReservationDTO } from '../../../models/reservations/create-reservation.dto';
import { ReviewService } from '../../../services/review/review.service';

@Component({
  selector: 'app-cars-reservation',
  standalone: true,
  imports: [NavbarClientComponent, CommonModule, FormsModule],
  templateUrl: './cars-reservation.component.html',
  styleUrl: './cars-reservation.component.css'
})
export class CarsReservationComponent implements OnInit {

  // --- Lista de coches ---
  cars: CarData[] = [];
  isLoading = true;
  errorMessage = '';

  // --- Modal ---
  showModal = false;
  selectedCar: CarData | null = null;

  // --- Fechas ---
  startDate = '';
  endDate = '';

  // --- Cálculo de reserva ---
  totalDays = 0;
  priceTotal = 0;

  // --- Descuento ---
  discountApplied = false;
  discountPercentage = 0;
  finalPrice = 0;

  // --- Alertas ---
  showAlert = false;
  showAlertReservationActive = false;

  // --- Reseñas  ---
  reviews: any[] = [];
  selectedCarForReviews: any = null;
  showReviewsModal = false;




  constructor(private carService: CarService, private reservationService: ReservationService, private reviewService: ReviewService) { }

  ngOnInit(): void {
    this.fetchCars();

  }

  // ──────────────────────────────────────────────
  // Carga de vehículos
  // ──────────────────────────────────────────────
  private fetchCars(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.carService.getAllCarsForEveryone().subscribe({
      next: (cars: CarData[]) => {

        this.cars = cars.map(car => ({
          ...car,
          pricePerDay: (car.pricePerDay as any)?.$numberDecimal
            ? Number((car.pricePerDay as any).$numberDecimal)
            : car.pricePerDay,

          isAvailable: typeof car.isAvailable === 'object' && car.isAvailable !== null
            ? car.isAvailable
            : { _id: '', status: 'Desconocido' },

          availableFrom: car.availableFrom
            ? new Date(car.availableFrom)
            : null
        }));

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los vehículos.';
        this.isLoading = false;
      }
    });
  }


  private buildReservationDTO(): CreateReservationDTO {
    return {
      carId: this.selectedCar!._id,
      startDate: this.startDate,
      endDate: this.endDate,
    };
  }

  // ──────────────────────────────────────────────
  // Modal
  // ──────────────────────────────────────────────
  generateReservation(car: CarData): void {
    if (car.isAvailable.status !== 'Disponible') return;

    const hasActiveReservation = false;

    if (hasActiveReservation) {
      this.triggerAlert('duplicate');
      return;
    }

    this.selectedCar = car;
    this.startDate = '';
    this.endDate = '';
    this.totalDays = 0;
    this.priceTotal = 0;
    this.discountApplied = false;
    this.discountPercentage = 0;
    this.finalPrice = 0;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCar = null;
  }

  private applyDiscount(totalDays: number, priceTotal: number) {
    let discountPercentage = 0;

    if (totalDays >= 14) {
      discountPercentage = 20;
    } else if (totalDays >= 7) {
      discountPercentage = 10;
    }

    const discountApplied = discountPercentage > 0;
    const finalPrice = priceTotal * (1 - discountPercentage / 100);

    return {
      discountApplied,
      discountPercentage,
      finalPrice,
    };
  }

  private resetCalculation(): void {
    this.totalDays = 0;
    this.priceTotal = 0;
    this.discountApplied = false;
    this.discountPercentage = 0;
    this.finalPrice = 0;
  }
  // ──────────────────────────────────────────────
  // Cálculo de días, precio y descuento
  // ──────────────────────────────────────────────
  calculateReservation(): void {
    if (!this.startDate || !this.endDate || !this.selectedCar) return;

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    if (end <= start) {
      this.resetCalculation();
      return;
    }

    const msPerDay = 1000 * 60 * 60 * 24;

    this.totalDays = Math.ceil((end.getTime() - start.getTime()) / msPerDay);
    this.priceTotal = this.totalDays * (this.selectedCar.pricePerDay ?? 0);

    // 🎯 Aplicar descuento
    const { discountApplied, discountPercentage, finalPrice } =
      this.applyDiscount(this.totalDays, this.priceTotal);

    this.discountApplied = discountApplied;
    this.discountPercentage = discountPercentage;
    this.finalPrice = finalPrice;
  }

  // ──────────────────────────────────────────────
  // Confirmar reserva
  // ──────────────────────────────────────────────
  confirmReservation(): void {
    if (!this.selectedCar || !this.startDate || !this.endDate || this.totalDays <= 0) return;

    const dto = this.buildReservationDTO();

    this.reservationService.createReservation(dto).subscribe({
      next: () => {
        this.closeModal();
        this.triggerAlert('success');
      },
      error: (err) => {
        const message = err?.error?.message || '';


        if (message.includes('reservado')) {
          this.triggerAlert('duplicate');
          return;
        }

        console.error('Error inesperado:', err);
      }
    });
  }

  // ──────────────────────────────────────────────
  // Alertas (se ocultan solas tras 3 segundos)
  // ──────────────────────────────────────────────
  private triggerAlert(type: 'success' | 'duplicate'): void {
    if (type === 'success') {
      this.showAlert = true;
      setTimeout(() => (this.showAlert = false), 3000);
    } else {
      this.showAlertReservationActive = true;
      setTimeout(() => (this.showAlertReservationActive = false), 3000);
    }
  }

  loadReviews(carId: string): void {
    console.log('Cargando reseñas para:', carId);

    this.reviewService.getReviewsByCar(carId).subscribe({
      next: (res) => {
        console.log('RESPUESTA BACKEND:', res); // 👈 IMPORTANTE

        this.reviews = res.data;
        this.showReviewsModal = true;
      },
      error: (err) => {
        console.error('ERROR:', err); // 👈 IMPORTANTE
      }
    });
  }

  viewReviews(car: any): void {
    console.log('CLICK en reseñas', car);

    this.selectedCarForReviews = car;

    this.reviewService.getReviewsByCar(car._id).subscribe({
      next: (res: any) => {
        console.log('RESPUESTA BACKEND:', res);

        this.reviews = res.data || [];
        this.showReviewsModal = true; // 👈 ESTO ES CLAVE
      },
      error: (err) => {
        console.error('Error cargando reseñas', err);
      }
    });
  }



}