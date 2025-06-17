import { Router } from "express";
import { statisticheEventiPassati } from "../controllers/statisticheController";
import { auth } from "../middlewares/auth";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get("/", auth, requireRole("organizzatore"), statisticheEventiPassati);

export default router;
