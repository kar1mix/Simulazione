import mongoose, { Document, Schema } from "mongoose";

export interface ICategoriaAcquisto extends Document {
  descrizione: string;
}

const CategoriaAcquistoSchema = new Schema<ICategoriaAcquisto>({
  descrizione: { type: String, required: true, unique: true },
});

export default mongoose.model<ICategoriaAcquisto>(
  "CategoriaAcquisto",
  CategoriaAcquistoSchema
);
