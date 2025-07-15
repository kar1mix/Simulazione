import mongoose, { Document, Schema } from "mongoose";

export interface IRichiestaAcquisto extends Document {
  categoriaID: mongoose.Types.ObjectId;
  oggetto: string;
  quantita: number;
  costoUnitario: number;
  motivazione: string;
  stato: "In attesa" | "Approvata" | "Rifiutata";
  utenteID: mongoose.Types.ObjectId;
  dataRichiesta: Date;
  dataApprovazione?: Date;
  utenteApprovazioneID?: mongoose.Types.ObjectId;
}

const RichiestaAcquistoSchema = new Schema<IRichiestaAcquisto>({
  categoriaID: {
    type: Schema.Types.ObjectId,
    ref: "CategoriaAcquisto",
    required: true,
  },
  oggetto: { type: String, required: true },
  quantita: { type: Number, required: true },
  costoUnitario: { type: Number, required: true },
  motivazione: { type: String, required: true },
  stato: {
    type: String,
    enum: ["In attesa", "Approvata", "Rifiutata"],
    default: "In attesa",
  },
  utenteID: { type: Schema.Types.ObjectId, ref: "Utente", required: true },
  dataRichiesta: { type: Date, default: Date.now },
  dataApprovazione: { type: Date },
  utenteApprovazioneID: { type: Schema.Types.ObjectId, ref: "Utente" },
});

export default mongoose.model<IRichiestaAcquisto>(
  "RichiestaAcquisto",
  RichiestaAcquistoSchema
);
