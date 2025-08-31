import app from "./app.js";
import { connectDB } from "./database.js";
import { initializeDefaults } from "./libs/initialSetup.js";

const PORT = process.env.PORT || 3030;

const startServer = async () => {
  await connectDB();
  await initializeDefaults();

  app.listen(PORT, () => {
    console.log(`🎧 Server listening on port ${PORT} 🌟`);
  });
};

startServer();
