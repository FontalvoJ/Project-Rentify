/*import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/dbs_rentify");

    console.log("🌟 Database is Connected");

    mongoose.connection.on("error", (err) => {
      console.error("❌ Error de conexión a MongoDB:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB desconectado");
    });
  } catch (err) {
    console.error(
      "❌ Error inicial conectando a la base de datos:",
      err.message,
    );
  }
};

let isDBConnected = false;
export const isDatabaseConnected = () => isDBConnected;*/

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const MONGO_URI = process.env.MONGO_URI;
//console.log("ENV COMPLETO:", process.env);
//console.log("MONGO_URI:", process.env.MONGO_URI);

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🌟 Database connected successfully!");
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
};

connectDB();
