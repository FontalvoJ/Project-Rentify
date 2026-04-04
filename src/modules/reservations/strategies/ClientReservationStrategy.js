import IReservationStrategy from "./IReservationStrategy.js";

export default class ClientReservationStrategy extends IReservationStrategy {
  constructor(repository) {
    super();
    this.repository = repository;
  }

  async getReservations(user) {
    return await this.repository.getByClientId(user.id);
  }
}
