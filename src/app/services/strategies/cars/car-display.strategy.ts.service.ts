import { CarData } from "../../../models/cars/car-data";

/**
 * Interfaz base para definir estrategias
 * de visualización de vehículos.
 */
export interface CarDisplayStrategy {

  display(cars: CarData[]): CarData[];

}

/**
 * Estrategia para administradores
 * Muestra todos los vehículos.
 */
export class AdminDisplayStrategy implements CarDisplayStrategy {

  display(cars: CarData[]): CarData[] {
    return cars;
  }

}

/**
 * Estrategia para clientes
 * Muestra solo vehículos disponibles.
 */
export class ClientDisplayStrategy implements CarDisplayStrategy {

  display(cars: CarData[]): CarData[] {
    return cars.filter(car =>
      ['Disponible', 'Reservado', 'En Mantenimiento']
        .includes(car.isAvailable.status)
    );
  }

}


/**
 * Estrategia para usuarios públicos
 * Muestra autos disponibles sin autenticación.
 */
export class PublicDisplayStrategy implements CarDisplayStrategy {
  display(cars: CarData[]): CarData[] {
    return cars.filter(car =>
      ['Disponible', 'Reservado', 'En Mantenimiento']
        .includes(car.isAvailable.status)
    );
  }
}