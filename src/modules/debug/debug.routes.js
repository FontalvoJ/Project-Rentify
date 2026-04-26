import { Router } from "express";

const router = Router();

router.get("/test-error", (req, res, next) => {
  throw new Error("Error interno de prueba");
});

export default router;
