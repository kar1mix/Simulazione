import { Router } from "express";
import { register, login } from "../controllers/utenteController";
import { validateRegister, validateLogin } from "../middlewares/validateInput";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

export default router;
