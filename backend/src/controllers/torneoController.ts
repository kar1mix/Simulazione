import { Request, Response } from "express";
import Incontro from "../models/Incontro";
import Utente from "../models/Utente";

/**
 * @swagger
 * /api/torneo/partecipanti:
 *   get:
 *     summary: Ottiene la lista dei partecipanti al torneo
 *     tags: [Torneo]
 *     security:
 *       - bearerAuth: []
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
export const getPartecipanti = async (req: Request, res: Response) => {
  try {
    const partecipanti = await Utente.find({ iscrittoAlTorneo: true })
      .select("-password")
      .sort({ nome: 1, cognome: 1 });

    res.json(partecipanti);
  } catch (error) {
    console.error("Errore durante il recupero dei partecipanti:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/torneo/incontri:
 *   get:
 *     summary: Ottiene tutti gli incontri del torneo
 *     tags: [Torneo]
 *     security:
 *       - bearerAuth: []
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
export const getIncontri = async (req: Request, res: Response) => {
  try {
    const incontri = await Incontro.find()
      .populate("partecipanteAId", "nome cognome")
      .populate("partecipanteBId", "nome cognome")
      .sort({ data: 1 });

    res.json(incontri);
  } catch (error) {
    console.error("Errore durante il recupero degli incontri:", error);
    res.status(500).json({ message: "Errore interno del server" });
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
 *             $ref: '#/components/schemas/IncontroRequest'
 *     responses:
 *       201:
 *         description: Incontro creato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 incontro:
 *                   $ref: '#/components/schemas/Incontro'
 *       400:
 *         description: Dati mancanti o non validi
 *       403:
 *         description: Accesso negato - solo gli organizzatori possono creare incontri
 *       404:
 *         description: Partecipante non trovato
 *       500:
 *         description: Errore interno del server
 */
export const creaIncontro = async (req: Request, res: Response) => {
  try {
    if (req.user?.ruolo !== "organizzatore") {
      return res.status(403).json({ message: "Accesso negato" });
    }

    const { data, partecipanteAId, partecipanteBId } = req.body;

    if (!data || !partecipanteAId || !partecipanteBId) {
      return res
        .status(400)
        .json({ message: "Tutti i campi sono obbligatori" });
    }

    if (partecipanteAId === partecipanteBId) {
      return res
        .status(400)
        .json({ message: "I partecipanti devono essere diversi" });
    }

    const partecipanteA = await Utente.findById(partecipanteAId);
    const partecipanteB = await Utente.findById(partecipanteBId);

    if (!partecipanteA || !partecipanteB) {
      return res.status(404).json({ message: "Partecipante non trovato" });
    }

    if (!partecipanteA.iscrittoAlTorneo || !partecipanteB.iscrittoAlTorneo) {
      return res
        .status(400)
        .json({
          message: "Entrambi i partecipanti devono essere iscritti al torneo",
        });
    }

    const nuovoIncontro = new Incontro({
      data: new Date(data),
      partecipanteAId,
      partecipanteBId,
      giocato: false,
      puntiA: 0,
      puntiB: 0,
    });

    const incontroSalvato = await nuovoIncontro.save();
    await incontroSalvato.populate("partecipanteAId", "nome cognome");
    await incontroSalvato.populate("partecipanteBId", "nome cognome");

    res.status(201).json({
      message: "Incontro creato con successo",
      incontro: incontroSalvato,
    });
  } catch (error) {
    console.error("Errore durante la creazione dell'incontro:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/torneo/incontri/{incontroId}:
 *   put:
 *     summary: Aggiorna i risultati di un incontro (solo organizzatori)
 *     tags: [Torneo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: incontroId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'incontro da aggiornare
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [puntiA, puntiB]
 *             properties:
 *               puntiA:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 11
 *               puntiB:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 11
 *     responses:
 *       200:
 *         description: Incontro aggiornato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 incontro:
 *                   $ref: '#/components/schemas/Incontro'
 *       400:
 *         description: Punteggio non valido
 *       403:
 *         description: Accesso negato - solo gli organizzatori possono aggiornare incontri
 *       404:
 *         description: Incontro non trovato
 *       500:
 *         description: Errore interno del server
 */
export const aggiornaIncontro = async (req: Request, res: Response) => {
  try {
    if (req.user?.ruolo !== "organizzatore") {
      return res.status(403).json({ message: "Accesso negato" });
    }

    const { puntiA, puntiB } = req.body;
    const { incontroId } = req.params;

    if (puntiA === undefined || puntiB === undefined) {
      return res.status(400).json({ message: "Punti A e B sono obbligatori" });
    }

    if (puntiA < 0 || puntiA > 11 || puntiB < 0 || puntiB > 11) {
      return res
        .status(400)
        .json({ message: "I punti devono essere tra 0 e 11" });
    }

    if (puntiA === puntiB && puntiA === 11) {
      return res.status(400).json({ message: "Non può finire 11-11" });
    }

    const incontro = await Incontro.findById(incontroId);
    if (!incontro) {
      return res.status(404).json({ message: "Incontro non trovato" });
    }

    incontro.puntiA = puntiA;
    incontro.puntiB = puntiB;
    incontro.giocato = true;

    await incontro.save();
    await incontro.populate("partecipanteAId", "nome cognome");
    await incontro.populate("partecipanteBId", "nome cognome");

    res.json({
      message: "Incontro aggiornato con successo",
      incontro,
    });
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'incontro:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/torneo/incontri/{incontroId}:
 *   delete:
 *     summary: Elimina un incontro (solo organizzatori)
 *     tags: [Torneo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: incontroId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'incontro da eliminare
 *     responses:
 *       200:
 *         description: Incontro eliminato con successo
 *       403:
 *         description: Accesso negato - solo gli organizzatori possono eliminare incontri
 *       404:
 *         description: Incontro non trovato
 *       500:
 *         description: Errore interno del server
 */
export const eliminaIncontro = async (req: Request, res: Response) => {
  try {
    if (req.user?.ruolo !== "organizzatore") {
      return res.status(403).json({ message: "Accesso negato" });
    }

    const { incontroId } = req.params;
    const incontro = await Incontro.findById(incontroId);

    if (!incontro) {
      return res.status(404).json({ message: "Incontro non trovato" });
    }

    await Incontro.findByIdAndDelete(incontroId);

    res.json({ message: "Incontro eliminato con successo" });
  } catch (error) {
    console.error("Errore durante l'eliminazione dell'incontro:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/torneo/classifica:
 *   get:
 *     summary: Ottiene la classifica del torneo
 *     tags: [Torneo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Classifica del torneo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClassificaItem'
 *       500:
 *         description: Errore interno del server
 */
export const getClassifica = async (req: Request, res: Response) => {
  try {
    const partecipanti = await Utente.find({ iscrittoAlTorneo: true });
    const incontri = await Incontro.find({ giocato: true });

    const classifica = partecipanti.map((partecipante) => {
      const partiteGiocate = incontri.filter(
        (incontro) =>
          incontro.partecipanteAId.toString() === partecipante._id.toString() ||
          incontro.partecipanteBId.toString() === partecipante._id.toString()
      );

      const vinte = partiteGiocate.filter((incontro) => {
        if (
          incontro.partecipanteAId.toString() === partecipante._id.toString()
        ) {
          return incontro.puntiA > incontro.puntiB;
        } else {
          return incontro.puntiB > incontro.puntiA;
        }
      });

      const percentualeVittorie =
        partiteGiocate.length > 0
          ? ((vinte.length / partiteGiocate.length) * 100).toFixed(1)
          : "0.0";

      return {
        id: partecipante._id,
        nome: partecipante.nome,
        cognome: partecipante.cognome,
        partiteGiocate: partiteGiocate.length,
        vinte: vinte.length,
        percentualeVittorie: `${percentualeVittorie}%`,
      };
    });

    classifica.sort((a, b) => {
      if (a.vinte !== b.vinte) {
        return b.vinte - a.vinte;
      }
      return (
        parseFloat(b.percentualeVittorie) - parseFloat(a.percentualeVittorie)
      );
    });

    res.json(classifica);
  } catch (error) {
    console.error("Errore durante il calcolo della classifica:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
};
