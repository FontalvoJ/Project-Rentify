
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CarService } from '../../../services/cars/cars.service';
import { CreateCarData } from '../../../models/cars/create-car-data';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';



@Component({
  selector: 'app-list-cars-reservations',
  imports: [CommonModule, ReactiveFormsModule],
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

  formRegisterVehicle!: FormGroup;

  // Sistemas disponibles
  systems = environment.vehicleConfig.systems;

  // Tipos de acompañantes
  companionTypes = environment.vehicleConfig.companions;

  constructor(
    private fb: FormBuilder,
    private carService: CarService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Inicializa el formulario reactivo
   */
  private initializeForm(): void {
    this.formRegisterVehicle = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      color: ['', Validators.required],
      pricePerDay: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      location: ['', Validators.required],
      power: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      system: ['', Validators.required],
      companion: ['', Validators.required],
      imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      availability: [false]
    });
  }

  // -------------------------------------------------
  // CONTROL DEL MODAL
  // -------------------------------------------------

  /**
   * Abre el modal de registro
   */
  openModal(): void {
    this.isModalCar = true;
    this.formSubmitted = false;
    this.showErrorCreateCar = false;
  }

  /**
   * Cierra el modal y reinicia el formulario
   */
  closeModal(): void {
    this.isModalCar = false;
    this.showErrorCreateCar = false;
    this.formSubmitted = false;

    this.formRegisterVehicle.reset();
    this.formRegisterVehicle.patchValue({ availability: false });
  }

  // -------------------------------------------------
  // VALIDACIÓN DE CAMPOS
  // -------------------------------------------------

  /**
   * Verifica si un campo del formulario es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.formRegisterVehicle.get(fieldName);
    return !!(field && field.invalid && (field.touched || this.formSubmitted));
  }

  /**
   * Marca todos los campos como tocados
   */
  private markFormTouched(): void {
    Object.values(this.formRegisterVehicle.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  // -------------------------------------------------
  // ENVÍO DEL FORMULARIO
  // -------------------------------------------------

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {

    this.formSubmitted = true;
    this.markFormTouched();

    if (this.formRegisterVehicle.invalid) {
      this.showErrorCreateCar = true;
      return;
    }

    this.isSubmitting = true;

    const carData = this.buildCarPayload();

    this.carService.createCar(carData).subscribe({
      next: () => this.handleSuccess(),
      error: () => this.handleError()
    });
  }

  // -------------------------------------------------
  // CONSTRUCCIÓN DEL OBJETO
  // -------------------------------------------------

  /**
   * Construye el objeto que se enviará al backend
   */
  private buildCarPayload(): CreateCarData {

    const formValue = this.formRegisterVehicle.value;

    return {
      brand: formValue.brand,
      model: formValue.model,
      year: Number(formValue.year),
      color: formValue.color,
      pricePerDay: Number(formValue.pricePerDay),
      location: formValue.location,
      power: Number(formValue.power),
      imageUrl: formValue.imageUrl.trim(),
      systemId: formValue.system,
      companionTypeId: formValue.companion,
      isAvailable: formValue.availability
    };
  }

  // -------------------------------------------------
  // RESPUESTAS DEL SERVIDOR
  // -------------------------------------------------

  /**
   * Maneja el caso exitoso de creación
   */
  private handleSuccess(): void {

    this.isSubmitting = false;

    this.showSuccessCarAlert = true;

    setTimeout(() => {
      this.showSuccessCarAlert = false;
    }, 3000);

    this.closeModal();

    // Notifica al componente padre que se creó un vehículo
    this.carCreated.emit();
  }

  /**
   * Maneja errores al crear el vehículo
   */
  private handleError(): void {

    this.isSubmitting = false;

    this.showErrorCreateCar = true;

    this.errorMessage = 'Error al crear el vehículo. Intenta nuevamente.';
  }

}