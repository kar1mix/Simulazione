import { Request, Response } from "express";
import Iscrizione from "../models/Iscrizione";
import Evento from "../models/Evento";
import { AuthRequest } from "../middlewares/auth";

// Iscrizione a un evento (solo dipendente)
export const iscrizione = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { eventoId } = req.body;
    const evento = await Evento.findById(eventoId);
    if (!evento) {
      res.status(404).json({ message: "Evento non trovato" });
      return;
    }
    // Controllo se l'evento è nel futuro
    if (new Date(evento.data) <= new Date()) {
      res
        .status(400)
        .json({ message: "Non è possibile iscriversi a un evento passato" });
      return;
    }
    // Controllo se l'utente è già iscritto
    const iscrizioneEsistente = await Iscrizione.findOne({
      utente: req.user!.id,
      evento: eventoId,
    });
    if (iscrizioneEsistente) {
      res.status(400).json({ message: "Sei già iscritto a questo evento" });
      return;
    }
    const nuovaIscrizione = new Iscrizione({
      utente: req.user!.id,
      evento: eventoId,
      dataIscrizione: new Date(),
      checkIn: false,
    });
    await nuovaIscrizione.save();
    // Incrementa numeroIscritti
    evento.numeroIscritti = (evento.numeroIscritti || 0) + 1;
    await evento.save();
    res.status(201).json(nuovaIscrizione);
  } catch (err) {
    res.status(500).json({ message: "Errore iscrizione", error: err });
  }
};

// Disiscrizione da un evento (solo dipendente)
export const disiscrizione = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { eventoId } = req.params;
    const evento = await Evento.findById(eventoId);
    if (!evento) {
      res.status(404).json({ message: "Evento non trovato" });
      return;
    }
    // Controllo se l'evento è domani o dopo
    const domani = new Date();
    domani.setDate(domani.getDate() + 1);
    if (new Date(evento.data) < domani) {
      res.status(400).json({
        message: "Non è possibile disiscriversi a meno di 24 ore dall'evento",
      });
      return;
    }
    const iscrizione = await Iscrizione.findOne({
      utente: req.user!.id,
      evento: eventoId,
    });
    if (!iscrizione) {
      res.status(404).json({ message: "Iscrizione non trovata" });
      return;
    }
    await iscrizione.deleteOne();
    // Decrementa numeroIscritti
    evento.numeroIscritti = Math.max((evento.numeroIscritti || 1) - 1, 0);
    await evento.save();
    res.json({ message: "Disiscrizione effettuata" });
  } catch (err) {
    res.status(500).json({ message: "Errore disiscrizione", error: err });
  }
};

// Lista iscrizioni dell'utente (solo dipendente)
export const listaIscrizioni = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const iscrizioni = await Iscrizione.find({ utente: req.user!.id })
      .populate("evento", "titolo data luogo")
      .populate("utente", "nome email");
    res.json(iscrizioni);
  } catch (err) {
    res.status(500).json({ message: "Errore recupero iscrizioni", error: err });
  }
};

// Check-in (solo organizzatore)
export const checkIn = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { iscrizioneId } = req.params;
    const iscrizione = await Iscrizione.findById(iscrizioneId);
    if (!iscrizione) {
      res.status(404).json({ message: "Iscrizione non trovata" });
      return;
    }
    const evento = await Evento.findById(iscrizione.evento);
    if (!evento) {
      res.status(404).json({ message: "Evento non trovato" });
      return;
    }
    // Solo l'organizzatore dell'evento può fare il check-in
    if (evento.organizzatore.toString() !== req.user!.id) {
      res.status(403).json({ message: "Non autorizzato a fare check-in" });
      return;
    }
    iscrizione.checkIn = true;
    await iscrizione.save();
    res.json(iscrizione);
  } catch (err) {
    res.status(500).json({ message: "Errore check-in", error: err });
  }
};
