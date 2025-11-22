
//mongoose
//.connect(
//"mongodb+srv://fontalvomejiajosedavid54:dtA9aiNDKmhytlOL@api-node-rentify.omp8p.mongodb.net/"
//)


  import mongoose from "mongoose";

  export const connectDB = async () => {
    try {
      await mongoose.connect("mongodb://0.0.0.0:27017/dbs_rentify");
      console.log("🌟 Database is Connected");
    } catch (err) {
      console.error("❌ Error connecting to the database:", err);
      process.exit(1);
    }
  };