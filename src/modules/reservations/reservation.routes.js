import { Router } from "express";
import ReservationController from "./reservation.controllers.js";
import ReservationService from "./reservations.service.js";
import DiscountService from "./discount.service.js";
import { authJwt, validateRoles } from "../../middlewares/authJwt.js";

const router = Router();

const discountService = new DiscountService();
const reservationService = new ReservationService(discountService);
const reservationController = new ReservationController(reservationService);

router.post(
  "/createReservation",
  [authJwt.verifyToken, validateRoles("client")],
  reservationController.createReservation,
);

router.get(
  "/listReservations",
  [authJwt.verifyToken, validateRoles("admin", "client")],
  reservationController.getReservations,
);

router.patch(
  "/updateStatus/:id",
  [authJwt.verifyToken, validateRoles("admin")],
  reservationController.updateReservationStatus,
);

export default router;
