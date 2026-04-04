import IReservationStrategy from "./IReservationStrategy.js";

export default class AdminReservationStrategy extends IReservationStrategy {
  constructor(repository) {
    super();
    this.repository = repository;
  }

  async getReservations() {
    return await this.repository.getAll();
  }
}
