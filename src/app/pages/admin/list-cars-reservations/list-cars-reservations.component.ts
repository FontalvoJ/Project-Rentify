import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CarService } from 'src/app/services/admin/admin.service';



@Component({
  selector: 'app-list-cars-reservations',
  templateUrl: './list-cars-reservations.component.html',
  styleUrls: ['./list-cars-reservations.component.css']
})
export class ListCarsReservationsComponent implements OnInit {

  @Output() carCreated = new EventEmitter<void>();
  
  isModalCar = false;
  isSubmitting = false;

  errorMessage = '';
  showSuccessCarAlert = false;
  showErrorCreateCar = false;
  formSubmitted = false;

  formRegisterVehicle: FormGroup;

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
      availability: [false]
    });
  }

  ngOnInit(): void {
  }

  // -------------------------------------------------
  // MODAL
  // -------------------------------------------------
  openModal() {
    this.isModalCar = true;
    this.formSubmitted = false;
    this.showErrorCreateCar = false;
  }

  closeModal() {
    this.isModalCar = false;
    this.showErrorCreateCar = false;
    this.formSubmitted = false;

    this.formRegisterVehicle.reset();
    this.formRegisterVehicle.patchValue({ availability: false });
  }

  // -------------------------------------------------
  // VALIDACIÓN
  // -------------------------------------------------
  isFieldInvalid(fieldName: string): boolean {
    const field = this.formRegisterVehicle.get(fieldName);
    return !!(field && field.invalid && (field.touched || this.formSubmitted));
  }

  // -------------------------------------------------
  // ENVIAR FORMULARIO
  // -------------------------------------------------
  onSubmit() {
    this.formSubmitted = true;

    Object.keys(this.formRegisterVehicle.controls).forEach(key => {
      this.formRegisterVehicle.get(key)?.markAsTouched();
    });

    if (!this.formRegisterVehicle.valid) {
      this.showErrorCreateCar = true;
      return;
    }

    this.isSubmitting = true;

    const formValue = this.formRegisterVehicle.value;

    const carData = {
      brand: formValue.brand,
      model: formValue.model,
      year: +formValue.year,
      color: formValue.color,
      pricePerDay: +formValue.pricePerDay,
      location: formValue.location,
      power: +formValue.power,
      imageUrl: formValue.imageUrl.trim(),
      systemId: formValue.system,
      companionTypeId: formValue.companion,
      availability: formValue.availability
    };

    this.carService.createCar(carData).subscribe({
      next: () => {

        this.isSubmitting = false;

        this.showSuccessCarAlert = true;
        setTimeout(() => this.showSuccessCarAlert = false, 3000);

        this.closeModal();
         this.carCreated.emit();
      },
      error: () => {
        this.isSubmitting = false;
        this.showErrorCreateCar = true;
        this.errorMessage = 'Error al crear el vehículo. Intenta nuevamente.';
      }
    });
  }
}
