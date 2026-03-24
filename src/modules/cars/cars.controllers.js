import { CreateCarDto, UpdateCarDto } from "../cars/car.dto.js";

export default class CarController {
  constructor(carService) {
    this.carService = carService;
  }
  /**
   * Ver todos los autos disponibles para visitas públicas (sin autenticación)
   */
  getAllCarsPublic = async (req, res) => {
    try {
      const cars = await this.carService.getAllCarsPublic();

      res.status(200).json({
        message: "Autos obtenidos correctamente",
        data: cars,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener los autos",
        error: error.message,
      });
    }
  };

  /**
   * Crear un auto (solo administradores)
   */
  createCar = async (req, res) => {
    try {
      const { user, roles } = req;

      if (!roles.includes("admin")) {
        return res.status(403).json({
          message: "Acceso denegado. Solo administradores pueden crear autos",
        });
      }

      const dto = new CreateCarDto(req.body);
      CreateCarDto.validate(dto);

      const newCar = await this.carService.createCar(dto, user._id);

      return res.status(201).json({
        message: "Auto creado exitosamente",
        data: newCar,
      });
    } catch (error) {
      console.error("Error creando el auto:", error);

      return res.status(400).json({
        message: error.message,
      });
    }
  };

  /**
   * Obtener autos según el rol:
   * - Admin → autos creados por él
   * - Cliente → autos disponibles
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

      return res.status(500).json({
        message: "Error interno al obtener autos",
      });
    }
  };

  /**
   * Eliminar un auto (solo administradores)
   */
  deleteCar = async (req, res) => {
    try {
      const { id } = req.params;

      const deletedCar = await this.carService.deleteCar(id);

      return res.status(200).json({
        message: "Auto eliminado correctamente",
        data: deletedCar,
      });
    } catch (error) {
      console.error("Error eliminando el auto:", error);

      return res.status(400).json({
        message: error.message,
      });
    }
  };

  /**
   * Actualizar un auto (solo administradores)
   */
  updateCar = async (req, res) => {
    try {
      const { id } = req.params;
      const { user, roles } = req;

      if (!roles.includes("admin")) {
        return res.status(403).json({
          message:
            "Acceso denegado. Solo administradores pueden actualizar autos",
        });
      }

      const dto = new UpdateCarDto(req.body);
      UpdateCarDto.validate(dto);

      const updatedCar = await this.carService.updateCar(id, dto, user);

      return res.status(200).json({
        message: "Auto actualizado correctamente",
        data: updatedCar,
      });
    } catch (error) {
      console.error("Error actualizando el auto:", error);

      if (error.message === "Auto no encontrado") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (error.message === "No tienes permisos para actualizar este auto") {
        return res.status(403).json({
          message: error.message,
        });
      }

      return res.status(400).json({
        message: error.message,
      });
    }
  };
}
