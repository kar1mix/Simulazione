import { Request, Response } from "express";
import RichiestaAcquisto from "../models/RichiestaAcquisto";
import CategoriaAcquisto from "../models/CategoriaAcquisto";
import Utente from "../models/Utente";

// GET /api/richieste - Elenco richieste (dipendente: proprie; responsabile: tutte)
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

// GET /api/richieste/:id - Dettaglio richiesta
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

// POST /api/richieste - Inserimento richiesta (solo dipendenti)
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

// PUT /api/richieste/:id - Modifica richiesta (solo se propria e non approvata)
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

// DELETE /api/richieste/:id - Elimina richiesta (solo se propria e non approvata, o responsabile se approvata)
export const eliminaRichiesta = async (req: Request, res: Response) => {
  try {
    const richiesta = await RichiestaAcquisto.findById(req.params.id);
    if (!richiesta)
      return res.status(404).json({ message: "Richiesta non trovata" });
    if (richiesta.stato !== "In attesa" && req.user.ruolo !== "Responsabile") {
      return res.status(403).json({
        message:
          "Solo i responsabili possono eliminare richieste approvate o rifiutate",
      });
    }
    if (
      req.user.ruolo !== "Responsabile" &&
      richiesta.utenteID.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Accesso negato" });
    }
    await richiesta.deleteOne();
    res.json({ message: "Richiesta eliminata" });
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};

// GET /api/richieste/da-approvare - Elenco richieste in attesa (solo responsabili)
export const getRichiesteDaApprovare = async (req: Request, res: Response) => {
  try {
    if (req.user.ruolo !== "Responsabile")
      return res.status(403).json({
        message: "Solo i responsabili possono vedere le richieste da approvare",
      });
    const richieste = await RichiestaAcquisto.find({ stato: "In attesa" })
      .populate("categoriaID")
      .populate("utenteID");
    res.json(richieste);
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};

// PUT /api/richieste/:id/approva - Approvazione richiesta (solo responsabili)
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

// PUT /api/richieste/:id/rifiuta - Rifiuto richiesta (solo responsabili)
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

export const getCategorie = async (req: Request, res: Response) => {
  try {
    const categorie = await CategoriaAcquisto.find();
    res.json(categorie);
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};

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
