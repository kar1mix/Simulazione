import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export function requireRole(ruolo: "dipendente" | "organizzatore") {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.ruolo !== ruolo) {
      res
        .status(403)
        .json({ message: "Accesso negato: permessi insufficienti" });
      return;
    }
    next();
  };
}
