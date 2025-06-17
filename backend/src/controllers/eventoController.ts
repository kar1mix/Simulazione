import { Request, Response } from "express";
import Evento from "../models/Evento";
import { AuthRequest } from "../middlewares/auth";

// Crea un nuovo evento (solo organizzatore)
export const createEvento = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { titolo, descrizione, data, luogo } = req.body;
    const nuovoEvento = new Evento({
      titolo,
      descrizione,
      data,
      luogo,
      organizzatore: req.user!.id,
      iscritti: [],
    });
    await nuovoEvento.save();
    res.status(201).json(nuovoEvento);
  } catch (err) {
    res.status(500).json({ message: "Errore creazione evento", error: err });
  }
};

// Lista di tutti gli eventi (visibile a tutti gli autenticati)
export const getEventi = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const eventi = await Evento.find().populate(
      "organizzatore",
      "nome email ruolo"
    );
    res.json(eventi);
  } catch (err) {
    res.status(500).json({ message: "Errore recupero eventi", error: err });
  }
};

// Dettaglio singolo evento
export const getEventoSingolo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const evento = await Evento.findById(req.params.id).populate(
      "organizzatore",
      "nome email ruolo"
    );
    if (!evento) {
      res.status(404).json({ message: "Evento non trovato" });
      return;
    }
    res.json(evento);
  } catch (err) {
    res.status(500).json({ message: "Errore recupero evento", error: err });
  }
};

// Modifica evento (solo organizzatore)
export const updateEvento = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      res.status(404).json({ message: "Evento non trovato" });
      return;
    }
    // Verifica che l'utente sia un organizzatore
    if (req.user!.ruolo !== "organizzatore") {
      res
        .status(403)
        .json({
          message: "Solo gli organizzatori possono modificare gli eventi",
        });
      return;
    }
    const { titolo, descrizione, data, luogo, postiDisponibili } = req.body;
    evento.titolo = titolo ?? evento.titolo;
    evento.descrizione = descrizione ?? evento.descrizione;
    evento.data = data ?? evento.data;
    evento.luogo = luogo ?? evento.luogo;
    evento.postiDisponibili = postiDisponibili ?? evento.postiDisponibili;
    await evento.save();
    res.json(evento);
  } catch (err) {
    res.status(500).json({ message: "Errore modifica evento", error: err });
  }
};

// Elimina evento (solo organizzatore)
export const deleteEvento = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      res.status(404).json({ message: "Evento non trovato" });
      return;
    }
    // Verifica che l'utente sia un organizzatore
    if (req.user!.ruolo !== "organizzatore") {
      res
        .status(403)
        .json({
          message: "Solo gli organizzatori possono eliminare gli eventi",
        });
      return;
    }
    await evento.deleteOne();
    res.json({ message: "Evento eliminato" });
  } catch (err) {
    res.status(500).json({ message: "Errore eliminazione evento", error: err });
  }
};
