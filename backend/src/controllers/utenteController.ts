import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Utente from "../models/Utente";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * @swagger
 * /api/utenti/register:
 *   post:
 *     summary: Registra un nuovo utente
 *     tags: [Utenti]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Utente registrato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 utente:
 *                   $ref: '#/components/schemas/Utente'
 *       400:
 *         description: Dati mancanti o email già esistente
 *       500:
 *         description: Errore interno del server
 */
export const register = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { nome, cognome, email, password, ruolo } = req.body;

    if (!nome || !cognome || !email || !password) {
      res.status(400).json({ message: "Tutti i campi sono obbligatori" });
      return;
    }

    const utenteEsistente = await Utente.findOne({ email });
    if (utenteEsistente) {
      res.status(400).json({ message: "Email già registrata" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuovoUtente = new Utente({
      nome,
      cognome,
      email,
      password: hashedPassword,
      ruolo: ruolo === "Responsabile" ? "Responsabile" : "Dipendente",
    });

    const utenteSalvato = await nuovoUtente.save();
    const { password: _, ...utenteSenzaPassword } = utenteSalvato.toObject();

    res.status(201).json({
      message: "Utente registrato con successo",
      utente: utenteSenzaPassword,
    });
  } catch (error) {
    console.error("Errore durante la registrazione:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/utenti/login:
 *   post:
 *     summary: Effettua il login di un utente
 *     tags: [Utenti]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login effettuato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 utente:
 *                   $ref: '#/components/schemas/Utente'
 *       400:
 *         description: Credenziali mancanti
 *       401:
 *         description: Credenziali non valide
 *       500:
 *         description: Errore interno del server
 */
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email e password sono obbligatori" });
      return;
    }

    const utente = await Utente.findOne({ email });
    if (!utente) {
      res.status(401).json({ message: "Credenziali non valide" });
      return;
    }

    const passwordValida = await bcrypt.compare(password, utente.password);
    if (!passwordValida) {
      res.status(401).json({ message: "Credenziali non valide" });
      return;
    }

    const token = jwt.sign(
      {
        userId: utente._id,
        email: utente.email,
        nome: utente.nome,
        cognome: utente.cognome,
        ruolo: utente.ruolo,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...utenteSenzaPassword } = utente.toObject();

    res.json({
      message: "Login effettuato con successo",
      token,
      utente: utenteSenzaPassword,
    });
  } catch (error) {
    console.error("Errore durante il login:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/utenti/profile:
 *   get:
 *     summary: Ottiene il profilo dell'utente autenticato
 *     tags: [Utenti]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profilo utente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Utente'
 *       401:
 *         description: Non autorizzato
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore interno del server
 */
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const utente = await Utente.findById(req.user?.userId).select("-password");
    if (!utente) {
      res.status(404).json({ message: "Utente non trovato" });
      return;
    }
    res.json(utente);
  } catch (error) {
    console.error("Errore durante il recupero del profilo:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
};
