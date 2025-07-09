import mongoose, { Document, Schema } from "mongoose";

export interface IUtente extends Document {
  nome: string;
  cognome: string;
  email: string;
  password: string;
  iscrittoAlTorneo: boolean;
  organizzatoreDelTorneo: boolean;
}

const UtenteSchema = new Schema<IUtente>({
  nome: { type: String, required: true },
  cognome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  iscrittoAlTorneo: { type: Boolean, default: false },
  organizzatoreDelTorneo: { type: Boolean, default: false },
});

export default mongoose.model<IUtente>("Utente", UtenteSchema);
