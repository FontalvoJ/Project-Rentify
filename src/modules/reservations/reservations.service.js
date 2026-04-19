import IReservationService from "./IReservationService.js";
import Reservation from "../../models/Reservations.js";
import Cars from "../../models/Cars.js";
import Client from "../../models/Client.js";
import ResState from "../../models/ResState.js";
import Review from "../../models/Review.js";
import CarAvailability from "../../models/AutoAvail.js";
import mongoose from "mongoose";

export default class ReservationService extends IReservationService {
  constructor(discountService) {
    super();
    this.discountService = discountService;
  }

  async createReservation(dto, userId) {
    const { carId, startDate, endDate } = dto;

    const canUseTransactions =
      mongoose.connection?.client?.topology?.description?.type !== "Single";

    const session = canUseTransactions ? await mongoose.startSession() : null;

    if (session) session.startTransaction();

    try {
      // Helper para aplicar sesión solo si existe
      const withSession = (query) => (session ? query.session(session) : query);

      const client = await withSession(Client.findOne({ userId }));

      if (!client) {
        throw new Error("Cliente no encontrado");
      }

      // Parseo correcto de fechas (evita problema UTC)
      const [year, month, day] = startDate.split("-").map(Number);
      const start = new Date(year, month - 1, day);

      const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
      const end = new Date(endYear, endMonth - 1, endDay);

      const now = new Date();

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);

      if (start < now) {
        throw new Error("No puedes reservar en fechas pasadas");
      }

      const car = await withSession(Cars.findById(carId));
      if (!car) throw new Error("Auto no encontrado");

      const disponible = await withSession(
        CarAvailability.findOne({ status: "Disponible" }),
      );

      if (!disponible) {
        throw new Error("Estado 'Disponible' no configurado");
      }

      if (!car.isAvailable.equals(disponible._id)) {
        throw new Error("El auto no está disponible");
      }

      const overlapping = await withSession(
        Reservation.findOne({
          carId,
          startDate: { $lt: end },
          endDate: { $gt: start },
        }),
      );

      if (overlapping) {
        throw new Error("El auto ya está reservado en esas fechas");
      }

      const diffTime = end - start;
      const totalDays = Math.max(
        1,
        Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
      );

      if (totalDays <= 0) {
        throw new Error("Rango de fechas inválido");
      }

      const pendingState = await withSession(
        ResState.findOne({ status: "Pendiente" }),
      );

      if (!pendingState) {
        throw new Error("Estado 'Pendiente' no configurado");
      }

      const pricePerDay = parseFloat(car.pricePerDay.toString());
      const totalCost = totalDays * pricePerDay;

      const { discountApplied, discountPercentage, finalCost } =
        this.discountService.calculate(totalDays, totalCost);

      const reservationData = {
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
      };

      let reservation;

      if (session) {
        const result = await Reservation.create([reservationData], { session });
        reservation = result[0];
      } else {
        reservation = await Reservation.create(reservationData);
      }

      if (session) {
        await session.commitTransaction();
        session.endSession();
      }

      return reservation;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw error;
    }
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

    const reservationsWithReviews = await Promise.all(
      reservations.map(async (res) => {
        const hasReview = await Review.findOne({
          reservationId: res._id,
        });

        return {
          ...this.mapReservation(res, isAdmin),
          hasReview: !!hasReview,
        };
      }),
    );

    return reservationsWithReviews;
    const now = new Date();

    for (const res of reservations) {
      if (res.resStateId?.status === "Activa" && new Date(res.endDate) < now) {
        const completedState = await ResState.findOne({
          status: "Completada",
        });

        if (completedState) {
          res.resStateId = completedState._id;
          await res.save();
        }
      }
    }

    //console.log("RESERVATIONS FOUND:", reservations.length);

    return reservations.map((res) => this.mapReservation(res, isAdmin));
  }

  mapReservation(res, isAdmin) {
    return {
      id: res._id,
      createdAt: res.createdAt,
      carId: res.carId?._id,
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
      paymentStatus: res.paymentStatus || "Pendiente",
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
      if (reservation.paymentStatus !== "Pagado") {
        throw new Error("No se puede activar una reserva sin pago");
      }

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

  async registerPayment(user, reservationId) {
    const isAdmin = user.roles?.some((r) => r.name === "admin");

    if (!isAdmin) {
      throw new Error("No autorizado");
    }

    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      throw new Error("Reserva no encontrada");
    }

    if (reservation.paymentStatus === "Pagado") {
      throw new Error("La reserva ya está pagada");
    }

    reservation.paymentStatus = "Pagado";
    reservation.paidAt = new Date();
    reservation.validatedBy = user._id;

    await reservation.save();

    return reservation;
  }

  async createReview(user, data) {
    const { reservationId, rating, comment } = data;

    const client = await Client.findOne({ userId: user._id });
    if (!client) throw new Error("Cliente no encontrado");

    const reservation =
      await Reservation.findById(reservationId).populate("resStateId");

    if (!reservation) throw new Error("Reserva no encontrada");

    if (reservation.clientId.toString() !== client._id.toString()) {
      throw new Error("No autorizado");
    }

    if (reservation.resStateId.status !== "Completada") {
      throw new Error("Solo puedes reseñar reservas completadas");
    }

    const existing = await Review.findOne({ reservationId });
    if (existing) {
      throw new Error("Ya existe una reseña para esta reserva");
    }

    return await Review.create({
      carId: reservation.carId,
      clientId: client._id,
      reservationId,
      rating,
      comment,
    });
  }

  async getReviewsByCar(carId) {
    return await Review.find({ carId })
      .populate({
        path: "clientId",
        populate: {
          path: "userId",
          model: "User",
        },
      })
      .sort({ createdAt: -1 });
  }
}
