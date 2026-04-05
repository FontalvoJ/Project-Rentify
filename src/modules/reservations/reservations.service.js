import IReservationService from "./IReservationService.js";
import Reservation from "../../models/Reservations.js";
import Cars from "../../models/Cars.js";
import Client from "../../models/Client.js";
import ResState from "../../models/ResState.js";
import CarAvailability from "../../models/AutoAvail.js";
import mongoose from "mongoose";

export default class ReservationService extends IReservationService {
  constructor(discountService) {
    super();
    this.discountService = discountService;
  }

  async createReservation(dto, userId) {
    const { carId, startDate, endDate } = dto;

    const client = await Client.findOne({ userId });

    if (!client) {
      throw new Error("Cliente no encontrado");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      throw new Error("No puedes reservar en fechas pasadas");
    }

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
      clientId: client._id,
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
    //console.log("USER COMPLETO:", user);

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    const role = user.roles?.[0]?.name;
    const isAdmin = role === "admin";

    let filter = {};

    if (isAdmin) {
      filter = {};
    } else {
      const client = await Client.findOne({ userId: user._id });

      if (!client) {
        throw new Error("Cliente no encontrado");
      }

      filter = { clientId: client._id };
    }

    //console.log("FILTER:", filter);

    const reservations = await Reservation.find(filter)
      .populate("carId")
      .populate({
        path: "clientId",
        populate: {
          path: "userId",
          model: "User",
        },
      })
      .populate("resStateId");

    //console.log("RESERVATIONS FOUND:", reservations.length);

    return reservations.map((res) => this.mapReservation(res, isAdmin));
  }

  mapReservation(res, isAdmin) {
    return {
      id: res._id,
      createdAt: res.createdAt,

      car: res.carId
        ? `${res.carId.brand} ${res.carId.model}`
        : "Auto eliminado",

      clientId: res.clientId?._id,
      clientName: res.clientId?.userId?.name,

      startDate: res.startDate,
      endDate: res.endDate,
      totalDays: res.totalDays,

      totalCost: res.finalCost,
      originalCost: res.totalCost,
      discountApplied: res.discountApplied,
      discountPercentage: res.discountPercentage,

      status: res.resStateId?.status || "Sin estado",
    };
  }

  async updateReservationStatus(user, id, status) {
    const isAdmin = user.roles?.some((r) => r.name === "admin");

    if (!isAdmin) {
      throw new Error("No autorizado");
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) throw new Error("Reserva no encontrada");

    const currentState = await ResState.findById(reservation.resStateId);
    const newState = await ResState.findOne({ status });

    if (!newState) throw new Error("Estado no válido");

    const allowedTransitions = {
      Pendiente: ["Activa", "Cancelada"],
      Activa: ["Completada", "Cancelada"],
      Completada: [],
      Cancelada: [],
    };

    if (!allowedTransitions[currentState.status].includes(status)) {
      throw new Error(
        `No se puede pasar de '${currentState.status}' a '${status}'`,
      );
    }

    if (reservation.resStateId.toString() === newState._id.toString()) {
      throw new Error("La reserva ya tiene ese estado");
    }

    const carId = reservation.carId._id;

    const [disponible, reservado] = await Promise.all([
      CarAvailability.findOne({ status: "Disponible" }),
      CarAvailability.findOne({ status: "Reservado" }),
    ]);

    if (!disponible || !reservado) {
      throw new Error("Estados del auto no configurados");
    }

    // 🚗 Si se activa → Reservado
    if (status === "Activa") {
      await Cars.findByIdAndUpdate(carId, {
        isAvailable: reservado._id,
      });
    }

    // 🚗 Si termina o se cancela → Disponible
    if (status === "Completada" || status === "Cancelada") {
      const activeState = await ResState.findOne({ status: "Activa" });

      const otherActive = await Reservation.findOne({
        carId: carId,
        _id: { $ne: reservation._id },
        resStateId: activeState._id,
      });

      if (!otherActive) {
        await Cars.findByIdAndUpdate(carId, {
          isAvailable: disponible._id,
        });
      }
    }

    reservation.resStateId = newState._id;
    await reservation.save();

    return reservation;
  }
}
