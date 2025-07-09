import mongoose, { Document, Schema, Types } from "mongoose";

export interface IIncontro extends Document {
  giocatore1: Types.ObjectId;
  giocatore2: Types.ObjectId;
  dataIncontro: Date;
  stato: 'programmato' | 'completato';
  risultato?: {
    punteggioGiocatore1: number;
    punteggioGiocatore2: number;
  };
}

const IncontroSchema = new Schema<IIncontro>({
  giocatore1: {
    type: Schema.Types.ObjectId,
    ref: "Utente",
    required: true,
  },
  giocatore2: {
    type: Schema.Types.ObjectId,
    ref: "Utente",
    required: true,
  },
  dataIncontro: { type: Date, required: true },
  stato: { 
    type: String, 
    enum: ['programmato', 'completato'], 
    default: 'programmato' 
  },
  risultato: {
    punteggioGiocatore1: { type: Number, min: 0 },
    punteggioGiocatore2: { type: Number, min: 0 },
  },
});

// Validazione: giocatore1 ≠ giocatore2
IncontroSchema.pre("save", function (next) {
  if (this.giocatore1.equals(this.giocatore2)) {
    return next(
      new Error("I giocatori non possono essere la stessa persona")
    );
  }
  next();
});

// Validazione punteggi ping-pong quando viene registrato un risultato
IncontroSchema.pre("save", function (next) {
  if (this.stato === 'completato' && this.risultato) {
    const { punteggioGiocatore1, punteggioGiocatore2 } = this.risultato;
    
    if (punteggioGiocatore1 < 0 || punteggioGiocatore2 < 0) {
      return next(new Error("I punteggi non possono essere negativi"));
    }

    // Regole ping-pong: vince chi arriva a 11 (se avversario <10) o chi supera 10 con +2 punti
    const maxScore = Math.max(punteggioGiocatore1, punteggioGiocatore2);
    const minScore = Math.min(punteggioGiocatore1, punteggioGiocatore2);

    if (maxScore < 11) {
      return next(new Error("Il vincitore deve avere almeno 11 punti"));
    }

    if (maxScore === 11 && minScore >= 10) {
      return next(
        new Error(
          "Se un giocatore ha 11 punti, l'altro non può avere 10 o più punti"
        )
      );
    }

    if (maxScore > 11 && maxScore - minScore < 2) {
      return next(
        new Error(
          "Per vincere con più di 11 punti, la differenza deve essere di almeno 2 punti"
        )
      );
    }

    if (punteggioGiocatore1 === punteggioGiocatore2) {
      return next(new Error("Non sono ammessi pareggi nel ping-pong"));
    }
  }

  next();
});

export default mongoose.model<IIncontro>("Incontro", IncontroSchema);
