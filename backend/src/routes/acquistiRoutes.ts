import express from "express";
import { auth } from "../middlewares/auth";
import {
  getRichieste,
  getRichiestaById,
  creaRichiesta,
  aggiornaRichiesta,
  eliminaRichiesta,
  getRichiesteDaApprovare,
  approvaRichiesta,
  rifiutaRichiesta,
  getCategorie,
  creaCategoria,
  aggiornaCategoria,
  eliminaCategoria,
} from "../controllers/acquistiController";

const router = express.Router();

// Richieste di acquisto
router.get("/richieste", auth, getRichieste);
router.get("/richieste/da-approvare", auth, getRichiesteDaApprovare);
router.get("/richieste/:id", auth, getRichiestaById);
router.post("/richieste", auth, creaRichiesta);
router.put("/richieste/:id", auth, aggiornaRichiesta);
router.delete("/richieste/:id", auth, eliminaRichiesta);
router.put("/richieste/:id/approva", auth, approvaRichiesta);
router.put("/richieste/:id/rifiuta", auth, rifiutaRichiesta);

// Categorie di acquisto
router.get("/categorie", auth, getCategorie);
router.post("/categorie", auth, creaCategoria);
router.put("/categorie/:id", auth, aggiornaCategoria);
router.delete("/categorie/:id", auth, eliminaCategoria);

export default router;
