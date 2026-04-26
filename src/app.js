
import express from "express";
import morgan from "morgan";
import cors from "cors";
import pkg from "../package.json";

import authRoutes from "./modules/auth/auth.routes.js";
import carRoutes from "./modules/cars/cars.routes.js";
import clientRoutes from "./modules/client/client.routes.js";
import reservationRoutes from "./modules/reservations/reservation.routes.js";
import chatbotRoutes from "./modules/chatbot/chatbot.routes.js";
import debugRoutes from "./modules/debug/debug.routes.js";


import { errorHandler } from "./middlewares/errorHandler.js"; 



const app = express();

app.use(morgan("dev"));
app.use(express.json());



const ALLOWED_ORIGINS = [
  "http://localhost:4200",
  "https://api-backend-rentify.onrender.com", 
  "https://project-rentify.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);


app.get("/", (_req, res) => {
  const { name, version, description, author } = pkg;
  res.json({ name, version, description, author });
});

app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/debug", debugRoutes); 

app.use(errorHandler);


export default app;
