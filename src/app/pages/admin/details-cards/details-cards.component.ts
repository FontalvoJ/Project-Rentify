import { Component, OnInit } from '@angular/core';
import { CarService } from 'src/app/services/admin/admin.service';

@Component({
  selector: 'app-details-cards',
  templateUrl: './details-cards.component.html',
  styleUrls: ['./details-cards.component.css']
})
export class DetailsCardsComponent implements OnInit {
  cars: any[] = [];
  originalCar: any; 

  isLoading: boolean = true;
  errorMessage: string = '';
  selectedCar: any = null;
  isModalOpenDeleteCar = false;
  showSuccessCarDelete: boolean = false;
  isModalOpenUpdateCar = false; 
  updateOption: string | null = null; 
  showAlertUpdateAvailability: boolean = false; 
  showAlertCarData = false;

  constructor(private carService: CarService) { }

  ngOnInit(): void {
    this.fetchCars();

  }


  fetchCars(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.carService.getAllCarsByAdmin().subscribe(
      (response: any) => {
        this.cars = response?.cars || [];
        this.isLoading = false;
      },
      (error) => {

        // console.error('Error fetching cars:', error);

        this.errorMessage = 'Failed to load cars. Please try again later.';
        this.isLoading = false;
      }
    );
  }


  openModalDeleteCar(car: any): void {
    this.selectedCar = car;
    this.isModalOpenDeleteCar = true;
    //console.log('Attempting to delete car with _id:', this.selectedCar.carId); // Log para verificar el _id
  }

  cancelDelete(): void {
    this.isModalOpenDeleteCar = false;
  }


  confirmDelete(): void {
    if (this.selectedCar && this.selectedCar.carId) {
      //console.log('Attempting to delete car with carId:', this.selectedCar.carId); 

      this.carService.deleteCar(this.selectedCar.carId).subscribe(
        (response) => {
          //console.log('Car deleted successfully!', response);

          this.cars = this.cars.filter(car => car.carId !== this.selectedCar.carId);
          this.isModalOpenDeleteCar = false;
          this.showSuccessCarDelete = true;


          setTimeout(() => {
            this.showSuccessCarDelete = false;
          }, 3000);
        },
        (error) => {

          console.error('Error deleting car:', error);
          if (error.error && error.error.message) {
            console.log('Error Message:', error.error.message);
          }

          this.errorMessage = 'Failed to delete the car. Please try again later.';
          this.isModalOpenDeleteCar = false;
        }
      );
    } else {
      console.error('Car carId is missing!');
    }
  }
  
  openModalUpdateCar(car: any): void {
    this.selectedCar = { ...car };  
    this.originalCar = { ...car };  
    this.isModalOpenUpdateCar = true;  
    this.updateOption = null; 
  }


  
  cancelUpdate(): void {
    this.isModalOpenUpdateCar = false;
    this.updateOption = '';
  }

  
  updateAvailability(): void {
    if (this.selectedCar && this.updateOption === 'availability') {
     
      if (this.selectedCar.availability !== this.originalCar.availability) {
        //console.log('Updating availability for car with ID:', this.selectedCar._id);
        //console.log('New availability status:', this.selectedCar.availability);

        const updatedCarData = { availability: this.selectedCar.availability };

       
        this.carService.updateCar(this.selectedCar._id, updatedCarData).subscribe(
          (response) => {
           // console.log('Availability updated successfully!', response);

            
            const updatedCarIndex = this.cars.findIndex(car => car._id === this.selectedCar._id);
            if (updatedCarIndex !== -1) {
              this.cars[updatedCarIndex].availability = this.selectedCar.availability;
            }

            this.showAlertUpdateAvailability = true;

            this.isModalOpenUpdateCar = false;
            setTimeout(() => {
              this.showAlertUpdateAvailability = false;
            }, 3000);
          },
          (error) => {
            console.error('Error updating car availability:', error);
            this.errorMessage = 'Failed to update car availability. Please try again later.';
          }
        );
      } else {
        console.log('No changes in availability. Update skipped.');
      }
    } else {
      console.error('Selected car or availability is missing');
    }
  }




  
  updateCarInfo(): void {
    if (this.selectedCar && this.updateOption === 'info') {
 
      const pricePerDay = parseFloat(this.selectedCar.pricePerDay);

    
      if (isNaN(pricePerDay)) {
        this.errorMessage = 'Price per day must be a number';
        return; 
      }

      
      const updatedCarData = {
        model: this.selectedCar.model,
        brand: this.selectedCar.brand,
        color: this.selectedCar.color,
        pricePerDay: pricePerDay, 
        location : this.selectedCar.location,
        power: this.selectedCar.power,
        system: this.selectedCar.system,
        accompanies: this.selectedCar.accompanies,
      };

      
      this.carService.updateCar(this.selectedCar._id, updatedCarData).subscribe(
        (response) => {
          this.showAlertCarData = true;

          this.isModalOpenUpdateCar = false;

          setTimeout(() => {
            location.reload(); 
          }, 3000); 

        },
        (error) => {
          this.errorMessage = 'Failed to update car info. Please try again later.'; 
        }
      );
    }
  }


}
