import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

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
