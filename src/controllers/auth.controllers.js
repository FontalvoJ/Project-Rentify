import { AuthService } from "../services/auth.service.js";

export const signUpClient = async (req, res) => {
  try {
    const user = await AuthService.registerUser(req.body, "client");

    const { token, role, name } = await AuthService.login({
      email: user.email,
      password: req.body.password,
    });

    res.status(201).json({ token, role, name });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const signUpAdmin = async (req, res) => {
  try {
    const user = await AuthService.registerUser(req.body, "admin");

    const { token, role, name } = await AuthService.login({
      email: user.email,
      password: req.body.password,
    });

    res.status(201).json({ token, role, name });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const signInUsers = async (req, res) => {
  try {
    const result = await AuthService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 400;
    res
      .status(status)
      .json({ error: error.message || "Error de autenticación." });
  }
};

export default {
  signUpClient,
  signUpAdmin,
  signInUsers,
};
