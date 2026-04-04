import { Component, OnInit } from '@angular/core';
import { CarDisplayContext } from '../../../services/strategies/cars/car-display.context.ts.service';
import { CarService } from '../../../services/cars/cars.service';
import { PublicDisplayStrategy } from '../../../services/strategies/cars/car-display.strategy.ts.service';
import { CarData } from '../../../models/cars/car-data';
import { NavbarHomeComponent } from "../../../layouts/navbar-home/navbar-home.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cars-visitors',
  imports: [CommonModule, NavbarHomeComponent, RouterModule],
  templateUrl: './cars-visitors.component.html',
  styleUrl: './cars-visitors.component.css',
})
export class CarsVisitorsComponent implements OnInit {
  cars: CarData[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private carService: CarService,
    private carDisplayContext: CarDisplayContext
  ) { }

  ngOnInit(): void {

    // Estrategia para visitantes
    this.carDisplayContext.setStrategy(new PublicDisplayStrategy());

    this.loadCars();
  }

  loadCars(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.carService.getAllCarsForEveryone().subscribe({
      next: (cars: CarData[]) => {
        const filteredCars = this.carDisplayContext.executeStrategy(cars);
        this.cars = this.mapCars(filteredCars);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando vehículos:', error);
        this.errorMessage = 'No se pudieron cargar los vehículos. Intenta nuevamente.';
        this.isLoading = false;
      }
    });
  }

  private mapCars(cars: any[]): CarData[] {
    return cars.map(car => ({
      ...car,
      pricePerDay: car.pricePerDay?.$numberDecimal || car.pricePerDay,
      systemType: car.systemId?.type || 'N/A',
      companionAmount: car.companionTypeId?.amount || 0,
      isAvailable: typeof car.isAvailable === 'object' && car.isAvailable !== null
        ? car.isAvailable
        : { _id: '', status: 'Desconocido' },
        availableFrom: car.availableFrom || null,
    }));
  }
}
