

// Interfaz base para definir la estrategia
export interface CarDisplayStrategy {
  display(cars: any[]): any[];
}

/**
 *  Estrategia para los administradores
 * Muestra todos los autos.
 */
export class AdminDisplayStrategy implements CarDisplayStrategy {
  display(cars: any[]): any[] {
    return cars;
  }
}

/**
 * Estrategia para los clientes
 * Muestra solo los autos disponibles.
 */
export class ClientDisplayStrategy implements CarDisplayStrategy {
  display(cars: any[]): any[] {
    return cars.filter(c => c.isAvailable === true);
  }
}
