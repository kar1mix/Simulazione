import mongoose, { Document, Schema, Types } from "mongoose";

export interface IRichiestaAcquisto extends Document {
  richiestaID: Types.ObjectId;
  dataRichiesta: Date;
  categoriaID: Types.ObjectId;
  oggetto: string;
  quantita: number;
  costoUnitario: number;
  motivazione: string;
  stato: "In attesa" | "Approvata" | "Rifiutata";
  utenteID: Types.ObjectId;
  dataApprovazione?: Date;
  utenteApprovazioneID?: Types.ObjectId;
}

const RichiestaAcquistoSchema = new Schema<IRichiestaAcquisto>({
  dataRichiesta: { type: Date, required: true, default: Date.now },
  categoriaID: {
    type: Schema.Types.ObjectId,
    ref: "CategoriaAcquisto",
    required: true,
  },
  oggetto: { type: String, required: true },
  quantita: { type: Number, required: true, min: 1 },
  costoUnitario: { type: Number, required: true, min: 0 },
  motivazione: { type: String, required: true },
  stato: {
    type: String,
    enum: ["In attesa", "Approvata", "Rifiutata"],
    default: "In attesa",
  },
  utenteID: { type: Schema.Types.ObjectId, ref: "Utente", required: true },
  dataApprovazione: { type: Date },
  utenteApprovazioneID: { type: Schema.Types.ObjectId, ref: "Utente" },
});

export default mongoose.model<IRichiestaAcquisto>(
  "RichiestaAcquisto",
  RichiestaAcquistoSchema
);
