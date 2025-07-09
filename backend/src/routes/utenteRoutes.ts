import { Router } from "express";
import {
  register,
  login,
  getProfile,
  iscrizioneTorneo,
  diventaOrganizzatore,
} from "../controllers/utenteController";
import { validateRegister, validateLogin } from "../middlewares/validateInput";
import { auth } from "../middlewares/auth";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/profile", auth, getProfile);
router.post("/iscrizione", auth, iscrizioneTorneo);
router.post("/diventa-organizzatore", auth, diventaOrganizzatore);

export default router;
