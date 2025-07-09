// Punto di ingresso dell'applicazione Express

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";
import utenteRoutes from "./routes/utenteRoutes";
import torneoRoutes from "./routes/torneoRoutes";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/torneo-ping-pong";

// Middleware base
app.use(cors());
app.use(express.json());

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Test route
app.get("/", (_req, res) => {
  res.send(
    "API Torneo Ping-Pong Aziendale attiva! <a href='/api-docs'>Documentazione API</a>"
  );
});

// Connessione a MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connesso a MongoDB");
    app.listen(PORT, () => {
      console.log(`Server avviato su http://localhost:${PORT}`);
      console.log(`Documentazione API: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("Errore connessione MongoDB:", err);
    process.exit(1);
  });

// Gestione errori base
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Errore interno del server" });
  }
);

app.use("/api/utenti", utenteRoutes);
app.use("/api/torneo", torneoRoutes);
