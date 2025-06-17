// Punto di ingresso dell'applicazione Express

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import utenteRoutes from "./routes/utenteRoutes";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/gestione-eventi";

// Middleware base
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (_req, res) => {
  res.send("API Gestione Eventi attiva!");
});

// Connessione a MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connesso a MongoDB");
    app.listen(PORT, () => {
      console.log(`Server avviato su http://localhost:${PORT}`);
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
