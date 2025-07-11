import { Request, Response, NextFunction } from "express";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { nome, cognome, email, password } = req.body;
  if (!nome || typeof nome !== "string") {
    res.status(400).json({ message: "Nome obbligatorio" });
    return;
  }
  if (!cognome || typeof cognome !== "string") {
    res.status(400).json({ message: "Cognome obbligatorio" });
    return;
  }
  if (!email || !emailRegex.test(email)) {
    res.status(400).json({ message: "Email non valida" });
    return;
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    res
      .status(400)
      .json({ message: "Password troppo corta (min 6 caratteri)" });
    return;
  }
  next();
}

export function validateLogin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { email, password } = req.body;
  if (!email || !emailRegex.test(email)) {
    res.status(400).json({ message: "Email non valida" });
    return;
  }
  if (!password || typeof password !== "string") {
    res.status(400).json({ message: "Password obbligatoria" });
    return;
  }
  next();
}
