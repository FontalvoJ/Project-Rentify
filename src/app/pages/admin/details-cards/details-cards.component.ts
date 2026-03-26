import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CarService } from '../../../services/cars/cars.service';
import { AuthService } from '../../../services/auth/auth.service';
import { environment } from '../../../../environments/environment';

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
  systems = environment.vehicleConfig.systems;
  companionTypes = environment.vehicleConfig.companions;

  // Estados de UI
  isLoading = true;
  errorMessage = '';

  // Estados de modales
  selectedCar: CarData | null = null;
  editableCar: any = {};
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


    this.editableCar = {
      brand: car.brand,
      model: car.model,
      color: car.color,
      pricePerDay: car.pricePerDay,
      location: car.location,
      power: car.power,
      systemId: car.systemId?._id,
      companionTypeId: car.companionTypeId?._id,
      isAvailable: car.isAvailable,
    };

    this.updateOption = null;
    this.isModalOpenUpdateCar = true;
  }

  cancelUpdate(): void {
    this.isModalOpenUpdateCar = false;
    this.updateOption = null;
    this.selectedCar = null;
    this.editableCar = {};
  }



  private mapToUpdateDto(): any {
    const dto: any = {};

    if (this.editableCar.pricePerDay !== undefined) {
      dto.pricePerDay = Number(this.editableCar.pricePerDay);
    }

    if (this.editableCar.power !== undefined) {
      dto.power = Number(this.editableCar.power);
    }

    if (this.editableCar.year !== undefined) {
      dto.year = Number(this.editableCar.year);
    }

    if (this.editableCar.isAvailable !== undefined) {
      dto.isAvailable = this.editableCar.isAvailable;
    }

    // strings directos
    dto.brand = this.editableCar.brand;
    dto.model = this.editableCar.model;
    dto.color = this.editableCar.color;
    dto.location = this.editableCar.location;

    dto.systemId = this.editableCar.systemId;
    dto.companionTypeId = this.editableCar.companionTypeId;

    return dto;
  }

  private updateCarRequest(): void {

    if (!this.selectedCar?._id) return;

    const payload = this.mapToUpdateDto();

    this.carService.updateCar(this.selectedCar._id, payload)
      .subscribe({

        next: () => {
          this.showAlertCarData = true;
          this.isModalOpenUpdateCar = false;
          this.selectedCar = null;
          this.fetchCars();

          setTimeout(() => this.showAlertCarData = false, 3000);
        },

        error: () => {
          this.errorMessage = 'No se pudo actualizar el vehículo.';
        }

      });
  }

  updateAvailability(): void {
    this.updateCarRequest();
  }

  updateCarInfo(): void {
    this.updateCarRequest();
  }

}