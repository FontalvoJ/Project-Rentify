import IReservationService from "./IReservationService.js";
import Reservation from "../../models/Reservations.js";
import Cars from "../../models/Cars.js";
import ResState from "../../models/ResState.js";
import mongoose from "mongoose";

export default class ReservationService extends IReservationService {
  constructor(discountService) {
    super();
    this.discountService = discountService;
  }

  async createReservation(dto, clientId) {
    const { carId, startDate, endDate } = dto;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    // 🚗 1. Validar auto
    const car = await Cars.findById(carId);
    if (!car) throw new Error("Auto no encontrado");

    if (!car.isAvailable) {
      throw new Error("El auto no está disponible");
    }

    const overlapping = await Reservation.findOne({
      carId,
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (overlapping) {
      throw new Error("El auto ya está reservado en esas fechas");
    }

    const diffTime = end - start;
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) {
      throw new Error("Rango de fechas inválido");
    }

    const pendingState = await ResState.findOne({ status: "Pendiente" });

    if (!pendingState) {
      throw new Error("Estado 'Pendiente' no configurado");
    }

    const pricePerDay = parseFloat(car.pricePerDay.toString());
    const totalCost = totalDays * pricePerDay;

    const { discountApplied, discountPercentage, finalCost } =
      this.discountService.calculate(totalDays, totalCost);

    return await Reservation.create({
      carId,
      clientId,
      startDate: start,
      endDate: end,
      totalDays,
      totalCost: mongoose.Types.Decimal128.fromString(totalCost.toString()),
      finalCost: mongoose.Types.Decimal128.fromString(finalCost.toString()),
      discountApplied,
      discountPercentage: mongoose.Types.Decimal128.fromString(
        discountPercentage.toString(),
      ),
      resStateId: pendingState._id,
    });
  }

  async getReservations(user) {
    const isAdmin = user.role === "admin";

    const filter = isAdmin ? {} : { clientId: user.id };

    const reservations = await Reservation.find(filter)
      .populate("carId")
      .populate("clientId")
      .populate("resStateId");

    // 🎯 Transformación de respuesta
    return reservations.map((res) => {
      if (isAdmin) {
        return {
          id: res._id,
          createdAt: res.createdAt,
          car: `${res.carId.brand} ${res.carId.model}`,
          clientId: res.clientId._id,
          clientName: res.clientId.name,
          startDate: res.startDate,
          endDate: res.endDate,
          totalDays: res.totalDays,
          totalCost: res.finalCost,
          status: res.resStateId.status,
        };
      }

      // 👤 Cliente
      return {
        car: `${res.carId.brand} ${res.carId.model}`,
        startDate: res.startDate,
        endDate: res.endDate,
        totalDays: res.totalDays,
        totalCost: res.finalCost,
        originalCost: res.totalCost,
        discountApplied: res.discountApplied,
        discountPercentage: res.discountPercentage,

        status: res.resStateId.status,
      };
    });
  }

  async updateReservationStatus(id, status) {
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      throw new Error("Reserva no encontrada");
    }

    const state = await ResState.findOne({ status });

    if (!state) {
      throw new Error("Estado no válido");
    }

    if (reservation.resStateId.toString() === state._id.toString()) {
      throw new Error("La reserva ya tiene ese estado");
    }

    reservation.resStateId = state._id;

    await reservation.save();

    return reservation;
  }
}
