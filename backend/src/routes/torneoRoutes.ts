import express from "express";
import {
  iscrizioneTorneo,
  promuoviOrganizzatore,
} from "../controllers/utenteController";
import {
  creaIncontro,
  getIncontri,
  registraRisultato,
  eliminaIncontro,
  getClassifica,
  getPartecipanti,
} from "../controllers/incontroController";
import { auth } from "../middlewares/auth";

const router = express.Router();

// Routes per utenti iscritti al torneo
router.post("/iscrizione", auth, iscrizioneTorneo);
router.post(
  "/promuovi-organizzatore/:userId",
  auth,
  promuoviOrganizzatore
);
router.get("/partecipanti", auth, getPartecipanti);
router.get("/incontri", auth, getIncontri);
router.get("/classifica", auth, getClassifica);

// Routes per organizzatori
router.post("/incontri", auth, creaIncontro);
router.put("/incontri/:id/risultato", auth, registraRisultato);
router.delete("/incontri/:id", auth, eliminaIncontro);

export default router;
