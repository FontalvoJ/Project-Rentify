import { Router } from "express";
import * as carsCtrl from "../controllers/cars.controllers";
import { authJwt, validateRoles } from "../middlewares/authJwt";

const router = Router();

// Ruta pública para obtener todos los coches (sin autenticación)
router.get("/allCars", carsCtrl.getAllCarsForEveryone);

// Ruta privada para obtener coches solo para usuarios autenticados
router.get(
  "/allCars/authenticated",
  [authJwt.verifyToken],
  carsCtrl.getCarsForAuthenticatedUsers
);

// Ruta privada para obtener coches solo por administrador
router.get(
  "/carsByAdmin",
  [authJwt.verifyToken, validateRoles("admin")],
  carsCtrl.getCarsByAdmin
);

// Ruta privada para crear coches solo por administrador
router.post(
  "/createCar",
  [authJwt.verifyToken, validateRoles("admin")],
  carsCtrl.createCar
);

// Ruta privada para actualizar coches solo por administrador
router.put(
  "/updateCar/:id",
  [authJwt.verifyToken, validateRoles("admin")],
  carsCtrl.updateCar
);

// Ruta privada para eliminar eliminar coches solo por administrador
router.delete(
  "/deleteCar/:id",
  authJwt.verifyToken,
  validateRoles("admin"),
  carsCtrl.deleteCar
);

export default router;
