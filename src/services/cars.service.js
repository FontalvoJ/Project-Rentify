import Cars from "../models/Cars.js";
import ICarService from "../interfaces/ICarService.js";

export default class CarService extends ICarService {
  async createCar(carData, userId) {
    if (!carData || !userId) {
      throw new Error("Datos faltantes o usuario no autenticado");
    }

    const newCar = await Cars.create({
      ...carData,
      createdBy: userId,
    });

    return newCar;
  }

  async getCarsByRole(roles, userId) {
    let query = {};

    if (roles.includes("admin")) {
      query = { createdBy: userId };
    } else if (roles.includes("client")) {
      query = { isAvailable: true };
    }

    const cars = await Cars.find(query)
      .populate("createdBy", "name email")
      .populate("systemId", "type")
      .populate("companionTypeId", "amount")
      .lean();

    return cars;
  }

  async deleteCar(carId) {
    if (!carId) {
      throw new Error("Car ID es requerido");
    }

    const car = await Cars.findById(carId);
    if (!car) {
      throw new Error("Auto no encontrado");
    }

    await Cars.findByIdAndDelete(carId);

    return { message: "Auto eliminado correctamente" };
  }
}
