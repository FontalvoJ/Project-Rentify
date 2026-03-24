import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CarService } from '../../../services/cars/cars.service';
import { AuthService } from '../../../services/auth/auth.service';

import { CarDisplayContext } from '../../../services/strategies/cars/car-display.context.ts.service';

import {
  AdminDisplayStrategy, ClientDisplayStrategy,
  PublicDisplayStrategy
} from '../../../services/strategies/cars/car-display.strategy.ts.service';

import { CarData } from '../../../models/cars/car-data';

@Component({
  selector: 'app-details-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './details-cards.component.html',
  styleUrl: './details-cards.component.css'
})
export class DetailsCardsComponent implements OnInit {

  cars: CarData[] = [];
  role: string | null = null;

  // Estados de UI
  isLoading = true;
  errorMessage = '';

  // Estados de modales
  selectedCar: CarData | null = null;
  isModalOpenDeleteCar = false;
  isModalOpenUpdateCar = false;

  // Alertas
  showSuccessCarDelete = false;
  showAlertUpdateAvailability = false;
  showAlertCarData = false;

  updateOption: string | null = null;

  constructor(
    private carService: CarService,
    private carDisplayContext: CarDisplayContext,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initializeComponent();
  }

  /**
   * Inicializa el componente
   */
  private initializeComponent(): void {

    this.role = this.authService.getUserRole();

    this.configureDisplayStrategy();

    this.fetchCars();

  }

  /**
   * Configura la estrategia de visualización según el rol
   */
  private configureDisplayStrategy(): void {

    if (this.role === 'admin') {
      this.carDisplayContext.setStrategy(new AdminDisplayStrategy());
    }

    else if (this.role === 'client') {
      this.carDisplayContext.setStrategy(new ClientDisplayStrategy());
    }

    else {
      this.carDisplayContext.setStrategy(new PublicDisplayStrategy());
    }

  }

  // -------------------------------------
  // CARGAR VEHÍCULOS
  // -------------------------------------

  /**
   * Obtiene los vehículos desde el servicio
   */
  fetchCars(): void {

    this.isLoading = true;
    this.errorMessage = '';

    const request$ = this.role
      ? this.carService.listCarsAdminClient()
      : this.carService.getAllCarsForEveryone();

    request$.subscribe({

      next: (cars: CarData[]) => {

        const processedCars = this.carDisplayContext.executeStrategy(cars);

        this.cars = this.mapCars(processedCars);

        this.isLoading = false;

      },

      error: () => {

        this.errorMessage = 'No se pudieron cargar los vehículos.';
        this.isLoading = false;

      }

    });

  }

  /**
   * Normaliza datos provenientes del backend
   */
  private mapCars(cars: any[]): CarData[] {

    return cars.map(car => ({
      ...car,

      pricePerDay: car.pricePerDay?.$numberDecimal || car.pricePerDay,

      systemType: car.systemId?.type || 'N/A',

      companionAmount: car.companionTypeId?.amount || 0

    }));

  }

  // -------------------------------------
  // ELIMINAR VEHÍCULO
  // -------------------------------------

  openModalDeleteCar(car: CarData): void {

    this.selectedCar = car;

    this.isModalOpenDeleteCar = true;

  }

  cancelDelete(): void {

    this.isModalOpenDeleteCar = false;

    this.selectedCar = null;

  }

  confirmDelete(): void {

    if (!this.selectedCar?._id) {
      console.error('No se ha seleccionado ningún vehículo.');
      return;
    }

    this.carService.deleteCar(this.selectedCar._id).subscribe({

      next: () => {

        this.showSuccessCarDelete = true;

        this.isModalOpenDeleteCar = false;

        this.selectedCar = null;

        this.fetchCars();

        setTimeout(() => {
          this.showSuccessCarDelete = false;
        }, 3000);

      },

      error: () => {

        this.errorMessage = 'No se pudo eliminar el vehículo.';

      }

    });

  }

  // -------------------------------------
  // ACTUALIZACIÓN (preparado para futuro)
  // -------------------------------------

  openModalUpdateCar(car: CarData): void {

    this.selectedCar = car;

    this.isModalOpenUpdateCar = true;

  }

  cancelUpdate(): void {

    this.isModalOpenUpdateCar = false;

    this.updateOption = null;

    this.selectedCar = null;

  }

  updateAvailability(): void {

    if (!this.selectedCar) return;

    this.showAlertUpdateAvailability = true;

  }

  updateCarInfo(): void {

    if (!this.selectedCar) return;

    this.showAlertCarData = true;

  }

}