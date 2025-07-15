import mongoose, { Document, Schema } from "mongoose";

export interface IUtente extends Document {
  nome: string;
  cognome: string;
  email: string;
  password: string;
  ruolo: "Dipendente" | "Responsabile";
}

const UtenteSchema = new Schema<IUtente>({
  nome: { type: String, required: true },
  cognome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  ruolo: { type: String, enum: ["Dipendente", "Responsabile"], required: true },
});

export default mongoose.model<IUtente>("Utente", UtenteSchema);
