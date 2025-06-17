import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEvento extends Document {
  titolo: string;
  descrizione: string;
  data: Date;
  luogo: string;
  organizzatore: Types.ObjectId;
  iscritti: Types.ObjectId[];
}

const EventoSchema = new Schema<IEvento>({
  titolo: { type: String, required: true },
  descrizione: { type: String, required: true },
  data: { type: Date, required: true },
  luogo: { type: String, required: true },
  organizzatore: { type: Schema.Types.ObjectId, ref: "Utente", required: true },
  iscritti: [{ type: Schema.Types.ObjectId, ref: "Iscrizione" }],
});

export default mongoose.model<IEvento>("Evento", EventoSchema);
