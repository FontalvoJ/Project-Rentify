import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CarService } from 'src/app/services/admin/admin.service';


@Component({
  selector: 'app-list-cars-reservations',
  templateUrl: './list-cars-reservations.component.html',
  styleUrls: ['./list-cars-reservations.component.css']
})

export class ListCarsReservationsComponent implements OnInit {
  isModalCar = false;
  isSubmitting = false;
  errorMessage = '';
  showSuccessCarAlert = false;
  showErrorCreateCar = false;

  formRegisterVehicle: FormGroup;

  // Listas estáticas con _id y valor
  systems = [
    { _id: '687c1f45c5895bf772dfdf0c', type: 'Gasolina' },
    { _id: '687c1f45c5895bf772dfdf0e', type: 'Electrónico' },
    { _id: '687c1f45c5895bf772dfdf0f', type: 'Diesel' },
    { _id: '687c1f45c5895bf772dfdf0d', type: 'Híbrido' },
  ];

  companionTypes = [
    { _id: '687c1f45c5895bf772dfdefe', amount: 2 },
    { _id: '687c1f45c5895bf772dfdeff', amount: 4 },
    { _id: '687c1f45c5895bf772dfdf00', amount: 5 },
    { _id: '687c1f45c5895bf772dfdf01', amount: 7 },
  ];

  constructor(private fb: FormBuilder, private carService: CarService) {
    this.formRegisterVehicle = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      color: ['', Validators.required],
      pricePerDay: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      location: ['', Validators.required],
      power: ['', Validators.required],
      system: ['', Validators.required],       
      companion: ['', Validators.required],    
      imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    });
  }

  ngOnInit(): void { }

  openModal() { this.isModalCar = true; }
  closeModal() {
    this.isModalCar = false;
    this.showErrorCreateCar = false;
  }

  onSubmit() {
    if (!this.formRegisterVehicle.valid) {
      this.showErrorCreateCar = true;
      this.errorMessage = 'The form is invalid. Please correct the errors.';
      return;
    }

    this.isSubmitting = true;

    const formValue = this.formRegisterVehicle.value;

    // Mapear al formato que espera el backend
    const carData = {
      brand: formValue.brand,
      model: formValue.model,
      year: parseInt(formValue.year, 10),
      color: formValue.color,
      pricePerDay: parseInt(formValue.pricePerDay, 10),
      location: formValue.location,
      power: parseInt(formValue.power, 10),
      imageUrl: formValue.imageUrl.trim(),
      systemId: formValue.system,          
      companionTypeId: formValue.companion, 
    };

    this.carService.createCar(carData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showSuccessCarAlert = true;
        setTimeout(() => this.showSuccessCarAlert = false, 3000);
        this.closeModal();
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to create car. Please try again later.';
      }
    });
  }
}
