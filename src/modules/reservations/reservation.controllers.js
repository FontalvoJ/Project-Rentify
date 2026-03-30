import { CreateReservationDTO } from "./reservation.dto.js";

export default class ReservationController {
  constructor(reservationService) {
    this.reservationService = reservationService;
  }

  createReservation = async (req, res) => {
    try {
      const dto = new CreateReservationDTO(req.body);
      dto.validate();

      if (!req.user || !req.user.id) {
        return res.status(401).json({
          message: "Usuario no autenticado",
        });
      }

      const clientId = req.user.id;

      const reservation = await this.reservationService.createReservation(
        dto,
        clientId,
      );

      res.status(201).json({
        message: "Reserva creada correctamente",
        data: reservation,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  };

  getReservations = async (req, res) => {
    try {
      const user = req.user;

      const reservations = await this.reservationService.getReservations(user);

      res.status(200).json({
        data: reservations,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  };

  updateReservationStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedReservation =
        await this.reservationService.updateReservationStatus(id, status);

      res.status(200).json({
        message: "Estado de la reserva actualizado",
        data: updatedReservation,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  };
}
