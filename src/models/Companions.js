import { Schema, model } from "mongoose";

const companionsSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
  },
  { versionKey: false, collection: "Companions" }
);

export default model("Companions", companionsSchema);
