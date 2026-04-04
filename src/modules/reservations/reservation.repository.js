import Reservation from "../../models/Reservations.js";
import ResState from "../../models/ResState.js";

export default class ReservationRepository {
  async getAll() {
    return await Reservation.find({ isActive: true })
      .populate("carId")
      .populate("clientId")
      .populate("resStateId");
  }

  async getByClientId(clientId) {
    return await Reservation.find({ clientId, isActive: true })
      .populate("carId")
      .populate("resStateId");
  }

  async getById(reservationId) {
    return await Reservation.findById(reservationId)
      .populate("carId")
      .populate("clientId")
      .populate("resStateId");
  }

  async updateStatus(reservationId, statusName) {
    const state = await ResState.findOne({ name: statusName });

    if (!state) {
      throw new Error("Invalid reservation status");
    }

    return await Reservation.findByIdAndUpdate(
      reservationId,
      { resStateId: state._id },
      { new: true },
    )
      .populate("carId")
      .populate("clientId")
      .populate("resStateId");
  }

  async create(reservationData) {
    const reservation = new Reservation(reservationData);
    return await reservation.save();
  }
}
