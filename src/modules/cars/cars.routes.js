import { Router } from "express";
import CarController from "../cars/cars.controllers.js";
import CarService from "../cars/cars.service.js";
import { authJwt, validateRoles } from "../../middlewares/authJwt.js";

const router = Router();

const carService = new CarService();
const carController = new CarController(carService);

router.get("/allCars", carController.getAllCarsPublic);

router.post(
  "/createCar",
  [authJwt.verifyToken, validateRoles("admin")],
  carController.createCar,
);

router.get("/listCarsAdminClient", authJwt.verifyToken, carController.getCars);

router.put(
  "/updateCar/:id",
  [authJwt.verifyToken, validateRoles("admin")],
  carController.updateCar,
);

router.delete(
  "/DeleteCar/:id",
  [authJwt.verifyToken, validateRoles("admin")],
  carController.deleteCar,
);

export default router;
