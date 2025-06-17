import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Utente from "./models/Utente";
import Evento from "./models/Evento";
import Iscrizione from "./models/Iscrizione";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/gestione-eventi";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connesso a MongoDB");

  // Svuota le collezioni
  await Utente.deleteMany({});
  await Evento.deleteMany({});
  await Iscrizione.deleteMany({});

  // Crea utenti
  const password = await bcrypt.hash("password123", 10);
  const organizzatori = await Utente.insertMany([
    {
      nome: "Luca Bianchi",
      email: "luca@azienda.com",
      password,
      ruolo: "organizzatore",
    },
    {
      nome: "Sara Verdi",
      email: "sara@azienda.com",
      password,
      ruolo: "organizzatore",
    },
  ]);
  const dipendenti = await Utente.insertMany([
    {
      nome: "Mario Rossi",
      email: "mario@azienda.com",
      password,
      ruolo: "dipendente",
    },
    {
      nome: "Giulia Neri",
      email: "giulia@azienda.com",
      password,
      ruolo: "dipendente",
    },
    {
      nome: "Anna Blu",
      email: "anna@azienda.com",
      password,
      ruolo: "dipendente",
    },
  ]);

  // Crea eventi
  const oggi = new Date();
  const evento1 = await Evento.create({
    titolo: "Corso Sicurezza",
    descrizione: "Formazione obbligatoria",
    data: new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() + 7, 9),
    luogo: "Aula Magna",
    organizzatore: organizzatori[0]._id,
    iscritti: [],
  });
  const evento2 = await Evento.create({
    titolo: "Team Building",
    descrizione: "Attività di gruppo",
    data: new Date(
      oggi.getFullYear(),
      oggi.getMonth(),
      oggi.getDate() + 14,
      14
    ),
    luogo: "Sala Conferenze",
    organizzatore: organizzatori[1]._id,
    iscritti: [],
  });
  const evento3 = await Evento.create({
    titolo: "Corso Primo Soccorso",
    descrizione: "Formazione passata",
    data: new Date(
      oggi.getFullYear(),
      oggi.getMonth(),
      oggi.getDate() - 10,
      10
    ),
    luogo: "Aula 2",
    organizzatore: organizzatori[0]._id,
    iscritti: [],
  });

  // Crea iscrizioni
  await Iscrizione.create([
    {
      utente: dipendenti[0]._id,
      evento: evento1._id,
      dataIscrizione: new Date(),
      checkIn: false,
    },
    {
      utente: dipendenti[1]._id,
      evento: evento1._id,
      dataIscrizione: new Date(),
      checkIn: false,
    },
    {
      utente: dipendenti[2]._id,
      evento: evento2._id,
      dataIscrizione: new Date(),
      checkIn: false,
    },
    {
      utente: dipendenti[0]._id,
      evento: evento3._id,
      dataIscrizione: new Date(),
      checkIn: true,
    },
    {
      utente: dipendenti[1]._id,
      evento: evento3._id,
      dataIscrizione: new Date(),
      checkIn: false,
    },
  ]);

  console.log("Seed completato!");
  console.log("Credenziali organizzatori:");
  console.log("  luca@azienda.com / password123");
  console.log("  sara@azienda.com / password123");
  console.log("Credenziali dipendenti:");
  console.log("  mario@azienda.com / password123");
  console.log("  giulia@azienda.com / password123");
  console.log("  anna@azienda.com / password123");

  await mongoose.disconnect();
}

seed();
