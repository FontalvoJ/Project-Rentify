import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cars",
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },
    totalCost: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: (v) => parseFloat(v.toString()),
    },
    finalCost: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: (v) => parseFloat(v.toString()),
    },
    discountApplied: {
      type: Boolean,
      default: false,
    },
    discountPercentage: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0.0,
      get: (v) => parseFloat(v.toString()),
    },
    resStateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResState",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "Reservations",
    toJSON: { getters: true },
  }
);

const Reservation = mongoose.model("Reservations", reservationSchema);

export default Reservation;
