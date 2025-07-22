import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CarService } from 'src/app/services/admin/admin.service';


@Component({
  selector: 'app-list-cars-reservations',
  templateUrl: './list-cars-reservations.component.html',
  styleUrls: ['./list-cars-reservations.component.css']
})

export class ListCarsReservationsComponent implements OnInit {
  isModalCar: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  showSuccessCarAlert: boolean = false;
  showErrorCreateCar = false; 

  formRegisterVehicle: FormGroup;

  constructor(private fb: FormBuilder, private carService: CarService) {
    this.formRegisterVehicle = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      color: ['', Validators.required],
      availability: [true],
      pricePerDay: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      location: ['', Validators.required],
      power: ['', Validators.required],
      system: ['', [Validators.required, Validators.pattern(/^(Gasolina|Diesel|Electrónico|Híbrido)$/)]],
      accompanists: ['', [Validators.required, Validators.pattern(/^(2|4|5|7)$/)]],
      imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    });
  }

  ngOnInit(): void { }

  openModal() {
    this.isModalCar = true;
  }

  closeModal() {
    this.isModalCar = false;
    this.showErrorCreateCar = false; 
  }

  onSubmit() {
    if (this.formRegisterVehicle.valid) {
      this.isSubmitting = true;

      const formValue = {
        ...this.formRegisterVehicle.value,
        year: parseInt(this.formRegisterVehicle.value.year, 10),
        pricePerDay: parseInt(this.formRegisterVehicle.value.pricePerDay, 10),
        accompanists: parseInt(this.formRegisterVehicle.value.accompanists, 10),
        imageUrl: this.formRegisterVehicle.value.imageUrl.trim()
      };

      const missingFields = Object.entries(formValue).filter(
        ([key, value]) => value === undefined || value === null || value === ''
      );

      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        this.errorMessage = 'All fields are required. Please check your input.';
        this.isSubmitting = false;
        return;
      }

      this.carService.createCar(formValue).subscribe(
        response => {
          //console.log('Car created successfully!', response);
          this.isSubmitting = false;
          this.showSuccessCarAlert = true;
          setTimeout(() => {
            this.showSuccessCarAlert = false;
          }, 3000);
          this.closeModal();
        },
        error => {
          //console.error('Error creating car:', error);
          this.isSubmitting = false;
          this.errorMessage = 'Failed to create car. Please try again later.';
        }
      );
    } else {
      //console.log('Form is invalid');
      this.showErrorCreateCar = true;
      this.errorMessage = 'The form is invalid. Please correct the errors.';
    }
  }


}
