import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Utente from "./models/Utente";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/approvazione-acquisti";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connesso a MongoDB");

  // Svuota la collezione utenti
  await Utente.deleteMany({});

  // Nessun utente di default: registrali dal frontend

  await mongoose.disconnect();
}

seed();
