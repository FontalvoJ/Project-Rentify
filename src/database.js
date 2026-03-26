/* import mongoose from "mongoose";
export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://0.0.0.0:27017/dbs_rentify");
    console.log("🌟 Database is Connected");
  } catch (err) {
    console.error("❌ Error connecting to the database:", err);
    process.exit(1);
  }
};*/


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
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("🌟 Database connected successfully!");
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
};

connectDB();
