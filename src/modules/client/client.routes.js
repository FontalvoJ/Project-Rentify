import { Router } from "express";
import { authJwt, validateRoles } from "../../middlewares/authJwt.js";

import ClientController from "../client/client.controllers.js";
import ClientServiceMongoose from "../client/client.service.js";
import UserServiceMongoose from "../client/user.service.js";

const router = Router();

// Inyección de dependencias
const clientService = new ClientServiceMongoose();
const userService = new UserServiceMongoose();
const clientController = new ClientController(clientService, userService);

router.get(
  "/clientGetData",
  [authJwt.verifyToken, validateRoles("client")],
  clientController.getClientInfo,
);

router.put(
  "/clientUpdate",
  [authJwt.verifyToken, validateRoles("client")],
  clientController.updateClientAccount,
);

router.delete(
  "/clientDelete",
  [authJwt.verifyToken, validateRoles("client")],
  clientController.deleteClientAccount,
);

export default router;
