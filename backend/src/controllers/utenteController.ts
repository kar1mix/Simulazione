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
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { nome, cognome, email, password } = req.body;

    if (!nome || !cognome || !email || !password) {
      return res
        .status(400)
        .json({ message: "Tutti i campi sono obbligatori" });
    }

    const utenteEsistente = await Utente.findOne({ email });
    if (utenteEsistente) {
      return res.status(400).json({ message: "Email già registrata" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuovoUtente = new Utente({
      nome,
      cognome,
      email,
      password: hashedPassword,
      iscrittoAlTorneo: false,
      organizzatoreDelTorneo: false,
    });

    const utenteSalvato = await nuovoUtente.save();
    const { password: _, ...utenteSenzaPassword } = utenteSalvato.toObject();

    return res.status(201).json({
      message: "Utente registrato con successo",
      utente: utenteSenzaPassword,
    });
  } catch (error) {
    console.error("Errore durante la registrazione:", error);
    return res.status(500).json({ message: "Errore interno del server" });
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
export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email e password sono obbligatori" });
    }

    const utente = await Utente.findOne({ email });
    if (!utente) {
      return res.status(401).json({ message: "Credenziali non valide" });
    }

    const passwordValida = await bcrypt.compare(password, utente.password);
    if (!passwordValida) {
      return res.status(401).json({ message: "Credenziali non valide" });
    }

    // Determina il ruolo basato sullo stato dell'utente
    let ruolo = "utente";
    if (utente.organizzatoreDelTorneo && utente.iscrittoAlTorneo) {
      ruolo = "both";
    } else if (utente.organizzatoreDelTorneo) {
      ruolo = "organizzatore";
    } else if (utente.iscrittoAlTorneo) {
      ruolo = "partecipante";
    }

    const token = jwt.sign(
      {
        userId: utente._id,
        email: utente.email,
        nome: utente.nome,
        cognome: utente.cognome,
        ruolo: ruolo,
        iscrittoAlTorneo: utente.iscrittoAlTorneo,
        organizzatoreDelTorneo: utente.organizzatoreDelTorneo,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...utenteSenzaPassword } = utente.toObject();

    return res.json({
      message: "Login effettuato con successo",
      token,
      utente: utenteSenzaPassword,
    });
  } catch (error) {
    console.error("Errore durante il login:", error);
    return res.status(500).json({ message: "Errore interno del server" });
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
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const utente = await Utente.findById(req.user?.userId).select("-password");
    if (!utente) {
      return res.status(404).json({ message: "Utente non trovato" });
    }
    return res.json(utente);
  } catch (error) {
    console.error("Errore durante il recupero del profilo:", error);
    return res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/utenti/iscrizione:
 *   post:
 *     summary: Iscrive l'utente al torneo
 *     tags: [Utenti]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Iscrizione effettuata con successo
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
 *         description: Utente già iscritto
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore interno del server
 */
export const iscrizioneTorneo = async (req: AuthRequest, res: Response) => {
  try {
    const utente = await Utente.findById(req.user?.userId);
    if (!utente) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    if (utente.iscrittoAlTorneo) {
      return res.status(400).json({ message: "Utente già iscritto al torneo" });
    }

    utente.iscrittoAlTorneo = true;
    await utente.save();

    // Determina il ruolo basato sullo stato aggiornato dell'utente
    let ruolo = "utente";
    if (utente.organizzatoreDelTorneo && utente.iscrittoAlTorneo) {
      ruolo = "both";
    } else if (utente.organizzatoreDelTorneo) {
      ruolo = "organizzatore";
    } else if (utente.iscrittoAlTorneo) {
      ruolo = "partecipante";
    }

    // Genera un nuovo token con lo stato aggiornato
    const nuovoToken = jwt.sign(
      {
        userId: utente._id,
        email: utente.email,
        nome: utente.nome,
        cognome: utente.cognome,
        ruolo: ruolo,
        iscrittoAlTorneo: utente.iscrittoAlTorneo,
        organizzatoreDelTorneo: utente.organizzatoreDelTorneo,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...utenteSenzaPassword } = utente.toObject();

    return res.json({
      message: "Iscrizione al torneo effettuata con successo",
      token: nuovoToken,
      utente: utenteSenzaPassword,
    });
  } catch (error) {
    console.error("Errore durante l'iscrizione:", error);
    return res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/utenti/promuovi-organizzatore/{userId}:
 *   post:
 *     summary: Promuove un utente a organizzatore
 *     tags: [Utenti]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'utente da promuovere
 *     responses:
 *       200:
 *         description: Utente promosso con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 utente:
 *                   $ref: '#/components/schemas/Utente'
 *       403:
 *         description: Accesso negato - solo gli organizzatori possono promuovere
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore interno del server
 */
export const promuoviOrganizzatore = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (req.user?.ruolo !== "organizzatore") {
      return res.status(403).json({ message: "Accesso negato" });
    }

    const utente = await Utente.findById(req.params.userId);
    if (!utente) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    utente.organizzatoreDelTorneo = true;
    await utente.save();

    const { password: _, ...utenteSenzaPassword } = utente.toObject();

    return res.json({
      message: "Utente promosso a organizzatore con successo",
      utente: utenteSenzaPassword,
    });
  } catch (error) {
    console.error("Errore durante la promozione:", error);
    return res.status(500).json({ message: "Errore interno del server" });
  }
};

/**
 * @swagger
 * /api/utenti/diventa-organizzatore:
 *   post:
 *     summary: Promuove l'utente corrente a organizzatore
 *     tags: [Utenti]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utente promosso a organizzatore con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 utente:
 *                   $ref: '#/components/schemas/Utente'
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore interno del server
 */
export const diventaOrganizzatore = async (req: AuthRequest, res: Response) => {
  try {
    const utente = await Utente.findById(req.user?.userId);
    if (!utente) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    utente.organizzatoreDelTorneo = true;
    await utente.save();

    // Determina il ruolo basato sullo stato aggiornato dell'utente
    let ruolo = "utente";
    if (utente.organizzatoreDelTorneo && utente.iscrittoAlTorneo) {
      ruolo = "both";
    } else if (utente.organizzatoreDelTorneo) {
      ruolo = "organizzatore";
    } else if (utente.iscrittoAlTorneo) {
      ruolo = "partecipante";
    }

    // Genera un nuovo token con il ruolo aggiornato
    const nuovoToken = jwt.sign(
      {
        userId: utente._id,
        email: utente.email,
        nome: utente.nome,
        cognome: utente.cognome,
        ruolo: ruolo,
        iscrittoAlTorneo: utente.iscrittoAlTorneo,
        organizzatoreDelTorneo: utente.organizzatoreDelTorneo,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...utenteSenzaPassword } = utente.toObject();

    return res.json({
      message: "Sei ora un organizzatore del torneo!",
      token: nuovoToken,
      utente: utenteSenzaPassword,
    });
  } catch (error) {
    console.error("Errore durante la promozione a organizzatore:", error);
    return res.status(500).json({ message: "Errore interno del server" });
  }
};
