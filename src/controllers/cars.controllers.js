import { CreateCarDto } from "../dtos/car.dto.js";

export default class CarController {
  constructor(carService) {
    this.carService = carService;
  }

  /**
   * Crea un auto (solo para admins)
   */
  createCar = async (req, res) => {
    try {
      const { user, roles } = req;

      if (!roles.includes("admin")) {
        return res.status(403).json({ message: "Acceso denegado" });
      }

      const dto = new CreateCarDto(req.body);
      CreateCarDto.validate(dto);

      const newCar = await this.carService.createCar(dto, user._id);

      return res.status(201).json({
        message: "Car creado exitosamente",
        data: newCar,
      });
    } catch (error) {
      console.error("Error creando el auto:", error);
      res.status(400).json({ message: error.message });
    }
  };

  /**
   * Lista autos según el rol del usuario:
   *  - Admin → autos creados por él.
   *  - Cliente → autos disponibles para reservar.
   */
  getCars = async (req, res) => {
    try {
      const { user, roles } = req;

      const cars = await this.carService.getCarsByRole(roles, user._id);

      return res.status(200).json({
        message: "Autos obtenidos correctamente",
        data: cars,
      });
    } catch (error) {
      console.error("Error obteniendo autos:", error);
      res.status(500).json({ message: error.message });
    }
  };
}
