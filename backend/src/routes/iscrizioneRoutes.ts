import { Router } from "express";
import {
  iscrizione,
  disiscrizione,
  listaIscrizioni,
  checkIn,
} from "../controllers/iscrizioneController";
import { auth } from "../middlewares/auth";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

// Iscrizione a un evento (solo dipendente)
router.post("/", auth, requireRole("dipendente"), iscrizione);
// Disiscrizione da un evento (solo dipendente)
router.delete("/:eventoId", auth, requireRole("dipendente"), disiscrizione);
// Lista iscrizioni dell'utente (solo dipendente)
router.get("/mie", auth, requireRole("dipendente"), listaIscrizioni);
// Check-in (solo organizzatore)
router.put(
  "/:iscrizioneId/check-in",
  auth,
  requireRole("organizzatore"),
  checkIn
);

export default router;
