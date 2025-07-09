import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Utente from "./models/Utente";
import Incontro from "./models/Incontro";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/torneo-ping-pong";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connesso a MongoDB");

  // Svuota le collezioni
  await Utente.deleteMany({});
  await Incontro.deleteMany({});

  // Crea utenti
  const password = await bcrypt.hash("password123", 10);

  const utenti = await Utente.insertMany([
    {
      nome: "Luca",
      cognome: "Bianchi",
      email: "luca@azienda.com",
      password,
      iscrittoAlTorneo: true,
      organizzatoreDelTorneo: true,
    },
    {
      nome: "Sara",
      cognome: "Verdi",
      email: "sara@azienda.com",
      password,
      iscrittoAlTorneo: true,
      organizzatoreDelTorneo: true,
    },
    {
      nome: "Mario",
      cognome: "Rossi",
      email: "mario@azienda.com",
      password,
      iscrittoAlTorneo: true,
      organizzatoreDelTorneo: false,
    },
    {
      nome: "Giulia",
      cognome: "Neri",
      email: "giulia@azienda.com",
      password,
      iscrittoAlTorneo: true,
      organizzatoreDelTorneo: false,
    },
    {
      nome: "Anna",
      cognome: "Blu",
      email: "anna@azienda.com",
      password,
      iscrittoAlTorneo: false,
      organizzatoreDelTorneo: false,
    },
  ]);

  // Crea alcuni incontri di esempio
  const oggi = new Date();
  await Incontro.create([
    {
      giocatore1: utenti[2]._id, // Mario
      giocatore2: utenti[3]._id, // Giulia
      dataIncontro: new Date(
        oggi.getFullYear(),
        oggi.getMonth(),
        oggi.getDate() + 1,
        14
      ),
      stato: "completato",
      risultato: {
        punteggioGiocatore1: 11,
        punteggioGiocatore2: 8,
      },
    },
    {
      giocatore1: utenti[0]._id, // Luca
      giocatore2: utenti[2]._id, // Mario
      dataIncontro: new Date(
        oggi.getFullYear(),
        oggi.getMonth(),
        oggi.getDate() + 2,
        15
      ),
      stato: "completato",
      risultato: {
        punteggioGiocatore1: 13,
        punteggioGiocatore2: 11,
      },
    },
    {
      giocatore1: utenti[1]._id, // Sara
      giocatore2: utenti[3]._id, // Giulia
      dataIncontro: new Date(
        oggi.getFullYear(),
        oggi.getMonth(),
        oggi.getDate() + 3,
        16
      ),
      stato: "programmato",
    },
  ]);

  console.log("Seed completato!");
  console.log("Credenziali organizzatori:");
  console.log("  luca@azienda.com / password123");
  console.log("  sara@azienda.com / password123");
  console.log("Credenziali partecipanti:");
  console.log("  mario@azienda.com / password123");
  console.log("  giulia@azienda.com / password123");
  console.log("Utente non iscritto:");
  console.log("  anna@azienda.com / password123");

  await mongoose.disconnect();
}

seed();
