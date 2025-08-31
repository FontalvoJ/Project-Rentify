import express from "express";
import morgan from "morgan";
import cors from "cors";
import pkg from "../package.json";
import authRoutes from "./routes/auth.routes";
//import carRoutes from "./routes/cars.routes";
//import reservationRoutes from "./routes/reservations.routes";
import clientRoutes from "./routes/client.routes";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

const allowedOrigins = [
  "http://localhost:4200",
  "https://api-node-rentify.onrender.com/",
  "https://demo-gpe-rentify.netlify.app",
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
  })
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
//app.use("/api/cars", carRoutes);
//app.use("/api/reservations", reservationRoutes);
app.use("/api/client", clientRoutes);

export default app;
