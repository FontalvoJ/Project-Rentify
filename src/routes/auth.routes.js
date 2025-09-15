import { Router } from "express";
import AuthController from "../controllers/auth.controllers.js";
import { AuthServiceMongoose } from "../services/auth.service.js";
import { validateDto } from "../middlewares/validateDto.js";
import { SignUpDTO, ClientSignUpDTO, SignInDTO } from "../dtos/auth.dto.js";

const router = Router();
const authController = new AuthController(new AuthServiceMongoose());

// Signup Cliente
router.post(
  "/signUpClient",
  validateDto(ClientSignUpDTO),
  authController.signUp("client")
);

// Signup Admin
router.post(
  "/signUpAdmin",
  validateDto(SignUpDTO),
  authController.signUp("admin")
);

// Signin
router.post("/signInUsers", validateDto(SignInDTO), authController.signIn);

export default router;
