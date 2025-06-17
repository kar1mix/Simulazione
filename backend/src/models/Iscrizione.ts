import mongoose, { Document, Schema, Types } from "mongoose";

export interface IIscrizione extends Document {
  utente: Types.ObjectId;
  evento: Types.ObjectId;
  dataIscrizione: Date;
  checkIn: boolean;
}

const IscrizioneSchema = new Schema<IIscrizione>({
  utente: { type: Schema.Types.ObjectId, ref: "Utente", required: true },
  evento: { type: Schema.Types.ObjectId, ref: "Evento", required: true },
  dataIscrizione: { type: Date, default: Date.now },
  checkIn: { type: Boolean, default: false },
});

export default mongoose.model<IIscrizione>("Iscrizione", IscrizioneSchema);
