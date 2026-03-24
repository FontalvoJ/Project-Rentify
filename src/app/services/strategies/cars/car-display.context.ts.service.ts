import { Injectable } from '@angular/core';
import { CarDisplayStrategy } from './car-display.strategy.ts.service';
import { CarData } from "../../../models/cars/car-data";


/**
 * Contexto que ejecuta la estrategia de visualización
 * según el tipo de usuario.
 */
@Injectable({
  providedIn: 'root'
})
export class CarDisplayContext {

  private strategy: CarDisplayStrategy | null = null;

  /**
   * Define la estrategia que se utilizará
   */
  setStrategy(strategy: CarDisplayStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Ejecuta la estrategia configurada
   */
  executeStrategy(cars: CarData[]): CarData[] {

    if (!this.strategy) {
      console.warn('No se ha definido una estrategia de visualización.');
      return cars;
    }

    return this.strategy.display(cars);

  }

}