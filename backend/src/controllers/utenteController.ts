import { Request, Response } from "express";
import Utente from "../models/Utente";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersegreto";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, password, ruolo } = req.body;

    // Controllo se l'utente esiste già
    const utenteEsistente = await Utente.findOne({ email });
    if (utenteEsistente) {
      res.status(400).json({ message: "Email già registrata" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea utente
    const nuovoUtente = new Utente({
      nome,
      email,
      password: hashedPassword,
      ruolo,
    });
    await nuovoUtente.save();

    res.status(201).json({ message: "Registrazione avvenuta con successo" });
  } catch (err) {
    res.status(500).json({ message: "Errore server", error: err });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const utente = await Utente.findOne({ email });
    if (!utente) {
      res.status(400).json({ message: "Credenziali non valide" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, utente.password);
    if (!passwordMatch) {
      res.status(400).json({ message: "Credenziali non valide" });
      return;
    }

    // Genera JWT
    const token = jwt.sign(
      { id: utente._id, ruolo: utente.ruolo, nome: utente.nome },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, ruolo: utente.ruolo, nome: utente.nome });
  } catch (err) {
    res.status(500).json({ message: "Errore server", error: err });
  }
};
