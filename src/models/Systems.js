import { Schema, model } from "mongoose";

const systemsSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
  },
  { versionKey: false, collection: "Systems" }
);

export default model("Systems", systemsSchema);
