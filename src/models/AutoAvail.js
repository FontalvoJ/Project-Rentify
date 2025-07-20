import { Schema, model } from "mongoose";

const autoAvailSchema = new Schema(
  {
    status: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { versionKey: false, collection: "AutoAvail" }
);

export default model("AutoAvail", autoAvailSchema);
