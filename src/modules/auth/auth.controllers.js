export default class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  signUp = (role) => async (req, res) => {
    try {
      const authResult = await this.authService.registerUser(
        req.validated,
        role
      );
      return res.status(201).json(authResult);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  signIn = async (req, res) => {
    try {
      const authResult = await this.authService.login(req.validated);
      return res.status(200).json(authResult);
    } catch (error) {
      return res.status(error.status || 400).json({
        error: error.message || "Error de autenticación.",
      });
    }
  };
}
