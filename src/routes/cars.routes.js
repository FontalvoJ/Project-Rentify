import { Router } from "express";
import CarController from "../controllers/cars.controllers.js";
import CarService from "../services/cars.service.js";
import { authJwt, validateRoles } from "../middlewares/authJwt.js";

const router = Router();

const carService = new CarService();
const carController = new CarController(carService);

router.post(
  "/createCar",
  [authJwt.verifyToken, validateRoles("admin")],
  carController.createCar
);

router.get("/listCarsAdminClient", authJwt.verifyToken, carController.getCars);

router.delete(
  "/DeleteCar/:id",
  [authJwt.verifyToken, validateRoles("admin")],
  carController.deleteCar
);

export default router;
