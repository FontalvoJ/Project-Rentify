import Cars from "../../models/Cars.js";
import ICarService from "../cars/ICarService.js";

export default class CarService extends ICarService {
  async createCar(carData, userId) {
    if (!carData || !userId) {
      throw new Error("Datos faltantes o usuario no autenticado");
    }

    return await Cars.create({
      ...carData,
      createdBy: userId,
    });
  }

  async getCarsByRole(roles, userId) {
    let query = {};

    if (roles.includes("admin")) {
      query = { createdBy: userId };
    }

    if (roles.includes("client")) {
      query = { isAvailable: true };
    }

    return await Cars.find(query)
      .populate("createdBy", "name email")
      .populate("systemId", "type")
      .populate("companionTypeId", "amount")
      .lean();
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

    return car; // 👈 retornamos el auto eliminado
  }

  async updateCar(carId, updateDto, user) {
    if (!carId) {
      throw new Error("Car ID es requerido");
    }

    const car = await Cars.findById(carId);

    if (!car) {
      throw new Error("Auto no encontrado");
    }

    if (car.createdBy.toString() !== user._id.toString()) {
      throw new Error("No tienes permisos para actualizar este auto");
    }

    const updatedCar = await Cars.findByIdAndUpdate(carId, updateDto, {
      new: true,
      omitUndefined: true,
    });

    if (!updatedCar) {
      throw new Error("Error actualizando el auto");
    }

    return updatedCar;
  }
}
