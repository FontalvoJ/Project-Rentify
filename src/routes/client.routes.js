import { Router } from "express";
import * as clientCtrl from "../controllers/client.controllers";
import { authJwt, validateRoles } from "../middlewares/authJwt";

const router = Router();

// Ruta para obtener la información del cliente autenticado
router.get(
  "/clientGetData",
  [authJwt.verifyToken, validateRoles("client")],
  clientCtrl.getClientInfo
);

// Ruta para actualizar la cuenta de un cliente
router.put(
  "/clientUpdate",
  [authJwt.verifyToken, validateRoles("client")],
  clientCtrl.updateClientAccount
);

// Ruta para eliminar la cuenta de un cliente
router.delete(
  "/clientDelete",
  [authJwt.verifyToken, validateRoles("client")],
  clientCtrl.deleteClientAccount
);

export default router;
