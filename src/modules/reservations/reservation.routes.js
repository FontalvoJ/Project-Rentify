import { Router } from "express";
import ReservationController from "./reservation.controllers.js";
import ReservationService from "./reservations.service.js";
import DiscountService from "./discount.service.js";
import { authJwt, validateRoles } from "../../middlewares/authJwt.js";
import { startReservationJobs } from "../../jobs/reservation.job.js";

const router = Router();

const discountService = new DiscountService();
const reservationService = new ReservationService(discountService);
startReservationJobs(reservationService);
const reservationController = new ReservationController(reservationService);

// 🔹 Crear reserva (cliente)
router.post(
  "/createReservation",
  [authJwt.verifyToken, validateRoles("client")],
  reservationController.createReservation,
);

// 🔹 Listar reservas (admin y cliente)
router.get(
  "/listReservations",
  [authJwt.verifyToken, validateRoles("admin", "client")],
  reservationController.getReservations,
);

// 🔹 Actualizar estado (solo admin)
router.patch(
  "/updateStatus/:id",
  [authJwt.verifyToken, validateRoles("admin")],
  reservationController.updateReservationStatus,
);

// 🔹 Registrar pago de una reserva (solo admin)
router.patch(
  "/registerPayment/:id",
  [authJwt.verifyToken, validateRoles("admin")],
  reservationController.registerPayment,
);

// 🔹 Crear reseña para una reserva (solo cliente)
router.post(
  "/createReview",
  [authJwt.verifyToken, validateRoles("client")],
  reservationController.createReview,
);

// 🔹 Obtener reseñas de un auto
router.get(
  "/reviews/:carId",
  [authJwt.verifyToken],
  reservationController.getReviewsByCar,
);


export default router;
