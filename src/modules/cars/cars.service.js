import Cars from "../../models/Cars.js";
import ICarService from "../cars/ICarService.js";
import mongoose from "mongoose";

export default class CarService extends ICarService {
  async getAllCarsPublic() {
    const cars = await Cars.find({ isAvailable: true })
      .populate("systemId")
      .populate("companionTypeId");

    return cars;
  }

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

    return car;
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

    if (updateDto.pricePerDay !== undefined) {
      updateDto.pricePerDay = mongoose.Types.Decimal128.fromString(
        updateDto.pricePerDay.toString(),
      );
    }

    if (updateDto.power !== undefined) {
      updateDto.power = Number(updateDto.power);
    }

    if (updateDto.year !== undefined) {
      updateDto.year = Number(updateDto.year);
    }

    if (updateDto.isAvailable !== undefined) {
      updateDto.isAvailable =
        updateDto.isAvailable === true || updateDto.isAvailable === "true";
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
