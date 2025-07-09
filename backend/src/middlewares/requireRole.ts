import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export function requireRole(ruolo: "iscritto" | "organizzatore") {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res
        .status(403)
        .json({ message: "Accesso negato: utente non autenticato" });
      return;
    }

    if (
      ruolo === "iscritto" &&
      req.user.ruolo !== "partecipante" &&
      req.user.ruolo !== "organizzatore"
    ) {
      res
        .status(403)
        .json({ message: "Accesso negato: devi essere iscritto al torneo" });
      return;
    }

    if (ruolo === "organizzatore" && req.user.ruolo !== "organizzatore") {
      res
        .status(403)
        .json({ message: "Accesso negato: devi essere un organizzatore" });
      return;
    }

    next();
  };
}
