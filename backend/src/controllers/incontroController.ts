import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import Incontro from "../models/Incontro";
import Utente from "../models/Utente";

/**
 * @swagger
 * /api/torneo/partecipanti:
 *   get:
 *     summary: Ottiene tutti i partecipanti al torneo
 *     tags: [Torneo]
 *     responses:
 *       200:
 *         description: Lista dei partecipanti
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Utente'
 *       500:
 *         description: Errore interno del server
 */
export const getPartecipanti = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const partecipanti = await Utente.find({ iscrittoAlTorneo: true })
      .select("-password")
      .sort({ nome: 1, cognome: 1 });

    res.json(partecipanti);
  } catch (err) {
    res.status(500).json({ message: "Errore server", error: err });
  }
};

/**
 * @swagger
 * /api/torneo/incontri:
 *   post:
 *     summary: Crea un nuovo incontro (solo organizzatori)
 *     tags: [Torneo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               giocatore1:
 *                 type: string
 *                 description: ID del primo giocatore
 *               giocatore2:
 *                 type: string
 *                 description: ID del secondo giocatore
 *               dataIncontro:
 *                 type: string
 *                 format: date-time
 *                 description: Data e ora dell'incontro
 *     responses:
 *       201:
 *         description: Incontro creato con successo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incontro'
 *       400:
 *         description: Dati non validi
 *       403:
 *         description: Accesso negato - solo organizzatori
 *       404:
 *         description: Giocatori non trovati
 *       500:
 *         description: Errore interno del server
 */
export const creaIncontro = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Verifica che l'utente sia un organizzatore usando i flag del token
    if (!req.user?.organizzatoreDelTorneo) {
      res.status(403).json({ message: "Accesso negato - solo organizzatori" });
      return;
    }

    const { giocatore1, giocatore2, dataIncontro } = req.body;

    // Verifica che entrambi i giocatori siano iscritti al torneo
    const player1 = await Utente.findById(giocatore1);
    const player2 = await Utente.findById(giocatore2);

    if (!player1 || !player2) {
      res
        .status(404)
        .json({ message: "Uno o entrambi i giocatori non trovati" });
      return;
    }

    if (!player1.iscrittoAlTorneo || !player2.iscrittoAlTorneo) {
      res.status(400).json({
        message: "Entrambi i giocatori devono essere iscritti al torneo",
      });
      return;
    }

    const nuovoIncontro = new Incontro({
      giocatore1,
      giocatore2,
      dataIncontro: new Date(dataIncontro),
      stato: "programmato",
    });

    await nuovoIncontro.save();

    // Popola i dati dei giocatori per la risposta
    await nuovoIncontro.populate("giocatore1", "nome cognome");
    await nuovoIncontro.populate("giocatore2", "nome cognome");

    res.status(201).json(nuovoIncontro);
  } catch (err: any) {
    if (
      err.message.includes("giocatori non possono essere la stessa persona")
    ) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Errore server", error: err.message });
    }
  }
};

/**
 * @swagger
 * /api/torneo/incontri:
 *   get:
 *     summary: Ottiene tutti gli incontri
 *     tags: [Torneo]
 *     responses:
 *       200:
 *         description: Lista degli incontri
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Incontro'
 *       500:
 *         description: Errore interno del server
 */
export const getIncontri = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const incontri = await Incontro.find()
      .populate("giocatore1", "nome cognome")
      .populate("giocatore2", "nome cognome")
      .sort({ dataIncontro: 1 });

    res.json(incontri);
  } catch (err) {
    res.status(500).json({ message: "Errore server", error: err });
  }
};

/**
 * @swagger
 * /api/torneo/incontri/{id}/risultato:
 *   put:
 *     summary: Registra o modifica il risultato di un incontro (solo organizzatori)
 *     tags: [Torneo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'incontro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               punteggioGiocatore1:
 *                 type: number
 *                 minimum: 0
 *               punteggioGiocatore2:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Risultato registrato/modificato con successo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incontro'
 *       400:
 *         description: Punteggi non validi
 *       403:
 *         description: Accesso negato - solo organizzatori
 *       404:
 *         description: Incontro non trovato
 *       500:
 *         description: Errore interno del server
 */
export const registraRisultato = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Verifica che l'utente sia un organizzatore usando i flag del token
    if (!req.user?.organizzatoreDelTorneo) {
      res.status(403).json({ message: "Accesso negato - solo organizzatori" });
      return;
    }

    const { id } = req.params;
    const { punteggioGiocatore1, punteggioGiocatore2 } = req.body;

    const incontro = await Incontro.findById(id);
    if (!incontro) {
      res.status(404).json({ message: "Incontro non trovato" });
      return;
    }

    // Aggiorna l'incontro con il risultato (permette anche la modifica di incontri completati)
    incontro.stato = "completato";
    incontro.risultato = {
      punteggioGiocatore1,
      punteggioGiocatore2,
    };

    await incontro.save();

    // Popola i dati dei giocatori per la risposta
    await incontro.populate("giocatore1", "nome cognome");
    await incontro.populate("giocatore2", "nome cognome");

    res.json(incontro);
  } catch (err: any) {
    if (err.message.includes("punteggi") || err.message.includes("pareggi")) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Errore server", error: err.message });
    }
  }
};

/**
 * @swagger
 * /api/torneo/incontri/{id}:
 *   delete:
 *     summary: Elimina un incontro (solo organizzatori)
 *     tags: [Torneo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'incontro
 *     responses:
 *       200:
 *         description: Incontro eliminato con successo
 *       403:
 *         description: Accesso negato - solo organizzatori
 *       404:
 *         description: Incontro non trovato
 *       500:
 *         description: Errore interno del server
 */
export const eliminaIncontro = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Verifica che l'utente sia un organizzatore usando i flag del token
    if (!req.user?.organizzatoreDelTorneo) {
      res.status(403).json({ message: "Accesso negato - solo organizzatori" });
      return;
    }

    const { id } = req.params;
    const incontro = await Incontro.findByIdAndDelete(id);

    if (!incontro) {
      res.status(404).json({ message: "Incontro non trovato" });
      return;
    }

    res.json({ message: "Incontro eliminato con successo" });
  } catch (err) {
    res.status(500).json({ message: "Errore server", error: err });
  }
};

/**
 * @swagger
 * /api/torneo/classifica:
 *   get:
 *     summary: Ottiene la classifica del torneo
 *     tags: [Torneo]
 *     responses:
 *       200:
 *         description: Classifica del torneo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   giocatore:
 *                     $ref: '#/components/schemas/Utente'
 *                   partiteGiocate:
 *                     type: number
 *                   vittorie:
 *                     type: number
 *                   sconfitte:
 *                     type: number
 *                   punti:
 *                     type: number
 *       500:
 *         description: Errore interno del server
 */
export const getClassifica = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const incontri = await Incontro.find({ stato: "completato" })
      .populate("giocatore1", "nome cognome")
      .populate("giocatore2", "nome cognome");

    // Calcola statistiche per ogni giocatore
    const statistiche: {
      [key: string]: {
        giocatore: any;
        partiteGiocate: number;
        vittorie: number;
        sconfitte: number;
        punti: number;
      };
    } = {};

    incontri.forEach((incontro) => {
      if (!incontro.risultato) return;

      const player1Id = incontro.giocatore1._id.toString();
      const player2Id = incontro.giocatore2._id.toString();

      // Inizializza statistiche se non esistono
      if (!statistiche[player1Id]) {
        statistiche[player1Id] = {
          giocatore: incontro.giocatore1,
          partiteGiocate: 0,
          vittorie: 0,
          sconfitte: 0,
          punti: 0,
        };
      }

      if (!statistiche[player2Id]) {
        statistiche[player2Id] = {
          giocatore: incontro.giocatore2,
          partiteGiocate: 0,
          vittorie: 0,
          sconfitte: 0,
          punti: 0,
        };
      }

      // Aggiorna statistiche
      statistiche[player1Id].partiteGiocate++;
      statistiche[player2Id].partiteGiocate++;

      if (
        incontro.risultato.punteggioGiocatore1 >
        incontro.risultato.punteggioGiocatore2
      ) {
        statistiche[player1Id].vittorie++;
        statistiche[player2Id].sconfitte++;
        statistiche[player1Id].punti += 3; // Vittoria = 3 punti
        statistiche[player2Id].punti += 0; // Sconfitta = 0 punti
      } else {
        statistiche[player2Id].vittorie++;
        statistiche[player1Id].sconfitte++;
        statistiche[player2Id].punti += 3; // Vittoria = 3 punti
        statistiche[player1Id].punti += 0; // Sconfitta = 0 punti
      }
    });

    // Converti in array e ordina per punti
    const classifica = Object.values(statistiche).sort((a, b) => {
      // Prima per punti
      if (b.punti !== a.punti) {
        return b.punti - a.punti;
      }
      // Poi per percentuale vittorie
      const aPercentuale =
        a.partiteGiocate > 0 ? a.vittorie / a.partiteGiocate : 0;
      const bPercentuale =
        b.partiteGiocate > 0 ? b.vittorie / b.partiteGiocate : 0;
      return bPercentuale - aPercentuale;
    });

    res.json(classifica);
  } catch (err) {
    res.status(500).json({ message: "Errore server", error: err });
  }
};
