import express from "express";
import morgan from "morgan";
import cors from "cors";
import pkg from "../package.json";
import authRoutes from "./modules/auth/auth.routes.js";
import carRoutes from "./modules/cars/cars.routes";
import reservationRoutes from "./modules/reservations/reservation.routes.js";
import clientRoutes from "./modules/client/client.routes";
import chatbotRoutes from "./modules/chatbot/chatbot.routes.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

const allowedOrigins = [
  "http://localhost:4200",
  "https://api-backend-rentify.onrender.com/",
  "https://project-rentify.netlify.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);

app.get("/", (req, res) => {
  const packageInfo = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
  };
  res.json(packageInfo);
});

app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/chatbot", chatbotRoutes);

export default app;
