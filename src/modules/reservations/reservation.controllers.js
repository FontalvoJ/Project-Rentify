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

      if (!user) {
        return res.status(401).json({
          message: "Usuario no autenticado",
        });
      }

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
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          message: "Usuario no autenticado",
        });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          message: "El estado es requerido",
        });
      }

      const updatedReservation =
        await this.reservationService.updateReservationStatus(user, id, status);

      res.status(200).json({
        message: "Estado de la reserva actualizado",
        data: updatedReservation,
      });
    } catch (error) {
      res.status(403).json({
        message: error.message,
      });
    }
  };

  registerPayment = async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          message: "Usuario no autenticado",
        });
      }

      const { id } = req.params;

      const reservation = await this.reservationService.registerPayment(
        user,
        id,
      );

      res.status(200).json({
        message: "Pago registrado correctamente",
        data: reservation,
      });
    } catch (error) {
      res.status(403).json({
        message: error.message,
      });
    }
  };

  createReview = async (req, res) => {
    try {
      const user = req.user;

      const review = await this.reservationService.createReview(user, req.body);

      res.status(201).json({
        message: "Reseña creada",
        data: review,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  };

  getReviewsByCar = async (req, res) => {
    try {
      const { carId } = req.params;

      const reviews = await this.reservationService.getReviewsByCar(carId);

      res.status(200).json({
        data: reviews,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  };
}
