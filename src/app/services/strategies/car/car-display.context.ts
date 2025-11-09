
import { Injectable } from '@angular/core';
import { CarDisplayStrategy } from './car-display.strategy';

@Injectable({ providedIn: 'root' })
export class CarDisplayContext {
    private strategy!: CarDisplayStrategy;

    setStrategy(strategy: CarDisplayStrategy) {
        this.strategy = strategy;
    }

    executeStrategy(cars: any[]): any[] {
        return this.strategy.display(cars);
    }
}
