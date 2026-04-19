import Cars from "../../models/Cars.js";
import ICarService from "../cars/ICarService.js";
import mongoose from "mongoose";
import ResState from "../../models/ResState.js";
import Reservation from "../../models/Reservations.js";

export default class CarService extends ICarService {
  /**
   * Aplica disponibilidad real según reservas activas
   */
  async #applyRealAvailability(cars) {
    const now = new Date();
    const activaState = await ResState.findOne({ status: "Activa" });
    const disponible = await mongoose
      .model("AutoAvail")
      .findOne({ status: "Disponible" });
    const reservado = await mongoose
      .model("AutoAvail")
      .findOne({ status: "Reservado" });

    if (!activaState) return cars;

    const activeReservations = await Reservation.find({
      resStateId: activaState._id,
    })
      .sort({ endDate: -1 })
      .select("carId endDate");

    // Map de carId → endDate
    const reservedCarsMap = new Map();

    for (const r of activeReservations) {
      const carId = r.carId.toString();

      if (!reservedCarsMap.has(carId)) {
        reservedCarsMap.set(carId, r.endDate);
      }
    }

    return cars.map((car) => {
      const carId = car._id.toString();
      const endDate = reservedCarsMap.get(carId);

      return {
        ...car,
        isAvailable: endDate ? reservado : car.isAvailable,
        availableFrom: endDate || null,
      };
    });
  }

  async getAllCarsPublic() {
    const cars = await Cars.find()
      .populate("isAvailable")
      .populate("systemId")
      .populate("companionTypeId")
      .lean();

    return this.#applyRealAvailability(cars);
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
      const disponible = await mongoose
        .model("AutoAvail")
        .findOne({ status: "Disponible" });
      query = { isAvailable: disponible._id };
    }

    const cars = await Cars.find(query)
      .populate("createdBy", "name email")
      .populate("isAvailable")
      .populate("systemId", "type")
      .populate("companionTypeId", "amount")
      .lean();

    return this.#applyRealAvailability(cars);
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
      updateDto.isAvailable = new mongoose.Types.ObjectId(
        updateDto.isAvailable,
      );
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
