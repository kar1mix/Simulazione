import { Request, Response } from "express";
import Evento from "../models/Evento";
import Iscrizione from "../models/Iscrizione";
import { AuthRequest } from "../middlewares/auth";

export const statisticheEventiPassati = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { dataInizio, dataFine } = req.query;
    const now = new Date();
    // Costruisci filtro per data
    const filtroData: any = { $lt: now };
    if (dataInizio) filtroData.$gte = new Date(dataInizio as string);
    if (dataFine) filtroData.$lte = new Date(dataFine as string);

    // Trova eventi passati organizzati da questo organizzatore
    const eventi = await Evento.find({
      organizzatore: req.user!.id,
      data: filtroData,
    });

    // Per ogni evento, calcola iscritti e check-in
    const stats = await Promise.all(
      eventi.map(async (evento) => {
        const iscritti = await Iscrizione.countDocuments({
          evento: evento._id,
        });
        const checkin = await Iscrizione.countDocuments({
          evento: evento._id,
          checkIn: true,
        });
        return {
          id: evento._id,
          titolo: evento.titolo,
          data: evento.data,
          luogo: evento.luogo,
          iscritti,
          checkIn: checkin,
        };
      })
    );

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Errore statistiche", error: err });
  }
};
