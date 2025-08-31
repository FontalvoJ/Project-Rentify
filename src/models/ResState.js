import { Schema, model } from "mongoose";

const resStateSchema = new Schema(
  {
    status: {
      type: String,
      required: true,
    },
  },
  { versionKey: false, collection: "ResState" }
);

export default model("ResState", resStateSchema);
