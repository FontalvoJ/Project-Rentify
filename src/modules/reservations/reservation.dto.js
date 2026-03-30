export class CreateReservationDTO {
  constructor({ carId, startDate, endDate }) {
    this.carId = carId;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  validate() {
    if (!this.carId) throw new Error("carId es requerido");
    if (!this.startDate) throw new Error("startDate es requerido");
    if (!this.endDate) throw new Error("endDate es requerido");

    if (new Date(this.startDate) >= new Date(this.endDate)) {
      throw new Error("La fecha de inicio debe ser menor a la fecha final");
    }
  }
}
