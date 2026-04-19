export default class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  signUp = (role) => async (req, res) => {
    try {
      const authResult = await this.authService.registerUser(
        req.validated,
        role,
      );
      return res.status(201).json(authResult);
    } catch (error) {
      next(error);
    }
  };

  signIn = async (req, res, next) => {
    try {
      const authResult = await this.authService.login(req.validated);
      return res.status(200).json(authResult);
      
    } catch (error) {
      next(error);
    }
  };
}
