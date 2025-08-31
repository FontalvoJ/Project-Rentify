import mongoose, { Schema, Types } from "mongoose";

const carSchema = new Schema(
  {
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1886,
      max: new Date().getFullYear(),
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    pricePerDay: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0,
      get: (v) => parseFloat(v.toString()),
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: (props) => `${props.value} is not a valid URL.`,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    power: {
      type: Number,
      required: true,
      min: 0,
    },

    systemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Systems",
      required: true,
    },
    companionTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Companions",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "Cars",
    toJSON: { getters: true },
  }
);

const Cars = mongoose.model("Cars", carSchema);

export default Cars;
