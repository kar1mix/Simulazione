import { Router } from "express";
import {
  createEvento,
  getEventi,
  getEventoSingolo,
  updateEvento,
  deleteEvento,
} from "../controllers/eventoController";
import { auth } from "../middlewares/auth";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

// Lista eventi (tutti gli autenticati)
router.get("/", auth, getEventi);
// Dettaglio evento
router.get("/:id", auth, getEventoSingolo);
// Crea evento (solo organizzatore)
router.post("/", auth, requireRole("organizzatore"), createEvento);
// Modifica evento (solo organizzatore)
router.put("/:id", auth, requireRole("organizzatore"), updateEvento);
// Elimina evento (solo organizzatore)
router.delete("/:id", auth, requireRole("organizzatore"), deleteEvento);

export default router;
