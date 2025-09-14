import { Router } from "express";
import { authJwt, validateRoles } from "../middlewares/authJwt.js";

import ClientController from "../controllers/client.controllers.js";
import ClientServiceMongoose from "../services/client.service.js";
import UserServiceMongoose from "../services/user.service.js";

const router = Router();

// Inyección de dependencias
const clientService = new ClientServiceMongoose();
const userService = new UserServiceMongoose();
const clientController = new ClientController(clientService, userService);

router.get(
  "/clientGetData",
  [authJwt.verifyToken, validateRoles("client")],
  clientController.getClientInfo
);

router.put(
  "/clientUpdate",
  [authJwt.verifyToken, validateRoles("client")],
  clientController.updateClientAccount
);

router.delete(
  "/clientDelete",
  [authJwt.verifyToken, validateRoles("client")],
  clientController.deleteClientAccount
);

export default router;
