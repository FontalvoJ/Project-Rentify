import { Component, OnInit } from '@angular/core';
import { CarService } from 'src/app/services/admin/admin.service';
import { CarDisplayContext } from 'src/app/services/strategies/car/car-display.context';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AdminDisplayStrategy, ClientDisplayStrategy } from 'src/app/services/strategies/car/car-display.strategy';

@Component({
  selector: 'app-details-cards',
  templateUrl: './details-cards.component.html',
  styleUrls: ['./details-cards.component.css']
})
export class DetailsCardsComponent implements OnInit {
  cars: any[] = [];
  role: string | null = null;

  // Estados visuales y modales
  isLoading = true;
  errorMessage = '';
  selectedCar: any = null;
  isModalOpenDeleteCar = false;
  showSuccessCarDelete = false;
  isModalOpenUpdateCar = false;
  updateOption: string | null = null;
  showAlertUpdateAvailability = false;
  showAlertCarData = false;

  constructor(
    private carService: CarService,
    private carDisplayContext: CarDisplayContext,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.role = this.authService.getUserRole();
    this.fetchCars();
  }


  fetchCars(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.carService.listCarsAdminClient().subscribe({
      next: (response) => {
        const cars = response?.data || response?.cars || [];
        console.log('🚗 Datos brutos desde backend:', response);
        //console.log('📦 Lista de autos procesada:', cars);


        // ✅ Obtiene el rol desde AuthService
        const role = this.authService.getUserRole();
        console.log('👤 Rol detectado:', role);

        if (role === 'admin') {
          this.carDisplayContext.setStrategy(new AdminDisplayStrategy());
        } else {
          this.carDisplayContext.setStrategy(new ClientDisplayStrategy());
        }

        this.cars = this.carDisplayContext.executeStrategy(cars).map(car => ({
          ...car,
          pricePerDay: car.pricePerDay?.$numberDecimal || car.pricePerDay,
          systemType: car.systemId?.type || 'N/A',
          companionAmount: car.companionTypeId?.amount || 0
          
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error fetching cars:', error);

        this.errorMessage = 'Failed to load cars. Please try again later.';
        this.isLoading = false;
      }
    });
  }


  // ---------------------------------------
  // 🔹 Eliminación de autos
  // ---------------------------------------
  openModalDeleteCar(car: any): void {
    this.selectedCar = car;
    this.isModalOpenDeleteCar = true;
  }

  cancelDelete(): void {
    this.isModalOpenDeleteCar = false;
  }

  confirmDelete(): void {

  }

  // ---------------------------------------
  // 🔹 Actualización de autos
  // ---------------------------------------
  openModalUpdateCar(car: any): void {
  }

  cancelUpdate(): void {
    this.isModalOpenUpdateCar = false;
    this.updateOption = '';
  }

  updateAvailability(): void {

  }

  updateCarInfo(): void {

  }
}
