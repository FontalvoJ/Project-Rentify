import { Router } from "express";
import AuthController from "../auth/auth.controllers.js";
import { AuthServiceMongoose } from "../auth/auth.service.js";


import { validateDto } from "../../middlewares/validateDto.js";
import { SignUpDTO, ClientSignUpDTO, SignInDTO } from "../auth/auth.dto.js";

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
