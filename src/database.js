const MONGO_URI =
  "mongodb+srv://fontalvomejiajosedavid54:dtA9aiNDKmhytlOL@api-node-rentify.omp8p.mongodb.net/dbs_rentify";
//const LOCAL_URI = "mongodb://localhost:27017/rentify";

export const connectDB = async () => {
  try {
    // Conexión a la base de datos
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("🌟 Database is connected");
  } catch (err) {
    console.error("❌ Error connecting to the database:", err);
    process.exit(1);
  }
};

connectDB();
