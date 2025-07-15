import { Request, Response } from "express";
import RichiestaAcquisto from "../models/RichiestaAcquisto";
import CategoriaAcquisto from "../models/CategoriaAcquisto";
import Utente from "../models/Utente";

/**
 * @swagger
 * /api/richieste:
 *   get:
 *     summary: Elenco richieste di acquisto
 *     tags: [Richieste]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista delle richieste
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RichiestaAcquisto'
 *       401:
 *         description: Non autorizzato
 *       500:
 *         description: Errore interno del server
 */
export const getRichieste = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    let richieste;
    if (user.ruolo === "Responsabile") {
      richieste = await RichiestaAcquisto.find()
        .populate("categoriaID")
        .populate("utenteID")
        .populate("utenteApprovazioneID");
    } else {
      richieste = await RichiestaAcquisto.find({ utenteID: user.userId })
        .populate("categoriaID")
        .populate("utenteID")
        .populate("utenteApprovazioneID");
    }
    res.json(richieste);
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/richieste/{id}:
 *   get:
 *     summary: Dettaglio richiesta di acquisto
 *     tags: [Richieste]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID della richiesta
 *     responses:
 *       200:
 *         description: Dettaglio richiesta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RichiestaAcquisto'
 *       401:
 *         description: Non autorizzato
 *       404:
 *         description: Richiesta non trovata
 *       500:
 *         description: Errore interno del server
 */
export const getRichiestaById = async (req: Request, res: Response) => {
  try {
    const richiesta = await RichiestaAcquisto.findById(req.params.id)
      .populate("categoriaID")
      .populate("utenteID")
      .populate("utenteApprovazioneID");
    if (!richiesta)
      return res.status(404).json({ message: "Richiesta non trovata" });
    if (
      req.user.ruolo !== "Responsabile" &&
      richiesta.utenteID.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Accesso negato" });
    }
    res.json(richiesta);
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/richieste:
 *   post:
 *     summary: Inserisce una nuova richiesta di acquisto
 *     tags: [Richieste]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RichiestaAcquisto'
 *     responses:
 *       201:
 *         description: Richiesta creata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RichiestaAcquisto'
 *       400:
 *         description: Dati mancanti
 *       401:
 *         description: Non autorizzato
 *       403:
 *         description: Solo i dipendenti possono inserire richieste
 *       500:
 *         description: Errore interno del server
 */
export const creaRichiesta = async (req: Request, res: Response) => {
  try {
    if (req.user.ruolo !== "Dipendente")
      return res
        .status(403)
        .json({ message: "Solo i dipendenti possono inserire richieste" });
    const { categoriaID, oggetto, quantita, costoUnitario, motivazione } =
      req.body;
    if (
      !categoriaID ||
      !oggetto ||
      !quantita ||
      !costoUnitario ||
      !motivazione
    ) {
      return res
        .status(400)
        .json({ message: "Tutti i campi sono obbligatori" });
    }
    const richiesta = new RichiestaAcquisto({
      categoriaID,
      oggetto,
      quantita,
      costoUnitario,
      motivazione,
      utenteID: req.user.userId,
      stato: "In attesa",
    });
    await richiesta.save();
    res.status(201).json(richiesta);
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/richieste/{id}:
 *   put:
 *     summary: Modifica una richiesta di acquisto
 *     tags: [Richieste]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID della richiesta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RichiestaAcquisto'
 *     responses:
 *       200:
 *         description: Richiesta aggiornata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RichiestaAcquisto'
 *       400:
 *         description: Richiesta già approvata o rifiutata
 *       401:
 *         description: Non autorizzato
 *       403:
 *         description: Accesso negato
 *       404:
 *         description: Richiesta non trovata
 *       500:
 *         description: Errore interno del server
 */
export const aggiornaRichiesta = async (req: Request, res: Response) => {
  try {
    const richiesta = await RichiestaAcquisto.findById(req.params.id);
    if (!richiesta)
      return res.status(404).json({ message: "Richiesta non trovata" });
    if (richiesta.stato !== "In attesa")
      return res
        .status(400)
        .json({ message: "Richiesta già approvata o rifiutata" });
    if (
      req.user.ruolo !== "Responsabile" &&
      richiesta.utenteID.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Accesso negato" });
    }
    const { categoriaID, oggetto, quantita, costoUnitario, motivazione } =
      req.body;
    richiesta.categoriaID = categoriaID || richiesta.categoriaID;
    richiesta.oggetto = oggetto || richiesta.oggetto;
    richiesta.quantita = quantita || richiesta.quantita;
    richiesta.costoUnitario = costoUnitario || richiesta.costoUnitario;
    richiesta.motivazione = motivazione || richiesta.motivazione;
    await richiesta.save();
    res.json(richiesta);
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/richieste/{id}:
 *   delete:
 *     summary: Elimina una richiesta di acquisto
 *     tags: [Richieste]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID della richiesta
 *     responses:
 *       200:
 *         description: Richiesta eliminata
 *       401:
 *         description: Non autorizzato
 *       403:
 *         description: Accesso negato
 *       404:
 *         description: Richiesta non trovata
 *       500:
 *         description: Errore interno del server
 */
export const eliminaRichiesta = async (req: Request, res: Response) => {
  try {
    const richiesta = await RichiestaAcquisto.findById(req.params.id);
    if (!richiesta)
      return res.status(404).json({ message: "Richiesta non trovata" });
    // Responsabile può sempre eliminare, dipendente solo se in attesa e propria
    if (
      req.user.ruolo !== "Responsabile" &&
      (richiesta.stato !== "In attesa" ||
        richiesta.utenteID.toString() !== req.user.userId)
    ) {
      return res.status(403).json({ message: "Accesso negato" });
    }
    await richiesta.deleteOne();
    res.json({ message: "Richiesta eliminata" });
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/richieste/da-approvare:
 *   get:
 *     summary: Elenco richieste da approvare (solo responsabile)
 *     tags: [Richieste]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista delle richieste
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RichiestaAcquisto'
 *       401:
 *         description: Non autorizzato
 *       403:
 *         description: Solo i responsabili possono vedere le richieste
 *       500:
 *         description: Errore interno del server
 */
export const getRichiesteDaApprovare = async (req: Request, res: Response) => {
  try {
    if (req.user.ruolo !== "Responsabile")
      return res.status(403).json({
        message: "Solo i responsabili possono vedere le richieste",
      });
    // Mostra tutte le richieste, non solo quelle in attesa
    const richieste = await RichiestaAcquisto.find()
      .populate("categoriaID")
      .populate("utenteID");
    res.json(richieste);
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/richieste/{id}/approva:
 *   put:
 *     summary: Approva una richiesta di acquisto
 *     tags: [Richieste]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID della richiesta
 *     responses:
 *       200:
 *         description: Richiesta approvata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RichiestaAcquisto'
 *       400:
 *         description: Richiesta già gestita
 *       401:
 *         description: Non autorizzato
 *       403:
 *         description: Solo i responsabili possono approvare richieste
 *       404:
 *         description: Richiesta non trovata
 *       500:
 *         description: Errore interno del server
 */
export const approvaRichiesta = async (req: Request, res: Response) => {
  try {
    if (req.user.ruolo !== "Responsabile")
      return res
        .status(403)
        .json({ message: "Solo i responsabili possono approvare richieste" });
    const richiesta = await RichiestaAcquisto.findById(req.params.id);
    if (!richiesta)
      return res.status(404).json({ message: "Richiesta non trovata" });
    if (richiesta.stato !== "In attesa")
      return res.status(400).json({ message: "Richiesta già gestita" });
    richiesta.stato = "Approvata";
    richiesta.dataApprovazione = new Date();
    richiesta.utenteApprovazioneID = req.user.userId;
    await richiesta.save();
    res.json(richiesta);
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/richieste/{id}/rifiuta:
 *   put:
 *     summary: Rifiuta una richiesta di acquisto
 *     tags: [Richieste]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID della richiesta
 *     responses:
 *       200:
 *         description: Richiesta rifiutata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RichiestaAcquisto'
 *       400:
 *         description: Richiesta già gestita
 *       401:
 *         description: Non autorizzato
 *       403:
 *         description: Solo i responsabili possono rifiutare richieste
 *       404:
 *         description: Richiesta non trovata
 *       500:
 *         description: Errore interno del server
 */
export const rifiutaRichiesta = async (req: Request, res: Response) => {
  try {
    if (req.user.ruolo !== "Responsabile")
      return res
        .status(403)
        .json({ message: "Solo i responsabili possono rifiutare richieste" });
    const richiesta = await RichiestaAcquisto.findById(req.params.id);
    if (!richiesta)
      return res.status(404).json({ message: "Richiesta non trovata" });
    if (richiesta.stato !== "In attesa")
      return res.status(400).json({ message: "Richiesta già gestita" });
    richiesta.stato = "Rifiutata";
    richiesta.dataApprovazione = new Date();
    richiesta.utenteApprovazioneID = req.user.userId;
    await richiesta.save();
    res.json(richiesta);
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};

// --- CATEGORIE DI ACQUISTO ---

/**
 * @swagger
 * /api/categorie:
 *   get:
 *     summary: Elenco categorie di acquisto
 *     tags: [Categorie]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista delle categorie
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoriaAcquisto'
 *       401:
 *         description: Non autorizzato
 *       500:
 *         description: Errore interno del server
 */
export const getCategorie = async (req: Request, res: Response) => {
  try {
    const categorie = await CategoriaAcquisto.find();
    res.json(categorie);
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/categorie:
 *   post:
 *     summary: Crea una nuova categoria di acquisto
 *     tags: [Categorie]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaAcquisto'
 *     responses:
 *       201:
 *         description: Categoria creata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaAcquisto'
 *       400:
 *         description: Dati mancanti
 *       401:
 *         description: Non autorizzato
 *       500:
 *         description: Errore interno del server
 */
export const creaCategoria = async (req: Request, res: Response) => {
  try {
    const { descrizione } = req.body;
    if (!descrizione)
      return res.status(400).json({ message: "Descrizione obbligatoria" });
    const categoria = new CategoriaAcquisto({ descrizione });
    await categoria.save();
    res.status(201).json(categoria);
  } catch (error) {
    console.error("Errore durante la creazione categoria:", error);
    res.status(500).json({ message: "Errore interno del server", error });
  }
};

/**
 * @swagger
 * /api/categorie/{id}:
 *   put:
 *     summary: Modifica una categoria di acquisto
 *     tags: [Categorie]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID della categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaAcquisto'
 *     responses:
 *       200:
 *         description: Categoria aggiornata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaAcquisto'
 *       401:
 *         description: Non autorizzato
 *       404:
 *         description: Categoria non trovata
 *       500:
 *         description: Errore interno del server
 */
export const aggiornaCategoria = async (req: Request, res: Response) => {
  try {
    const { descrizione } = req.body;
    const categoria = await CategoriaAcquisto.findByIdAndUpdate(
      req.params.id,
      { descrizione },
      { new: true }
    );
    if (!categoria)
      return res.status(404).json({ message: "Categoria non trovata" });
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/categorie/{id}:
 *   delete:
 *     summary: Elimina una categoria di acquisto
 *     tags: [Categorie]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID della categoria
 *     responses:
 *       200:
 *         description: Categoria eliminata
 *       401:
 *         description: Non autorizzato
 *       404:
 *         description: Categoria non trovata
 *       500:
 *         description: Errore interno del server
 */
export const eliminaCategoria = async (req: Request, res: Response) => {
  try {
    const categoria = await CategoriaAcquisto.findByIdAndDelete(req.params.id);
    if (!categoria)
      return res.status(404).json({ message: "Categoria non trovata" });
    res.json({ message: "Categoria eliminata" });
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};
