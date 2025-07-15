import { Request, Response } from "express";
import CategoriaAcquisto from "../models/CategoriaAcquisto";
import RichiestaAcquisto from "../models/Incontro";

// GET /api/categorie - Elenco categorie
export const getCategorie = async (req: Request, res: Response) => {
  try {
    const categorie = await CategoriaAcquisto.find();
    res.json(categorie);
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};

// POST /api/categorie - Aggiunta categoria (solo responsabili)
export const creaCategoria = async (req: Request, res: Response) => {
  try {
    if (req.user.ruolo !== "Responsabile")
      return res
        .status(403)
        .json({ message: "Solo i responsabili possono aggiungere categorie" });
    const { descrizione } = req.body;
    if (!descrizione)
      return res.status(400).json({ message: "Descrizione obbligatoria" });
    const esiste = await CategoriaAcquisto.findOne({ descrizione });
    if (esiste)
      return res.status(400).json({ message: "Categoria già esistente" });
    const categoria = new CategoriaAcquisto({ descrizione });
    await categoria.save();
    res.status(201).json(categoria);
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};

// PUT /api/categorie/:id - Modifica categoria (solo responsabili)
export const aggiornaCategoria = async (req: Request, res: Response) => {
  try {
    if (req.user.ruolo !== "Responsabile")
      return res
        .status(403)
        .json({ message: "Solo i responsabili possono modificare categorie" });
    const categoria = await CategoriaAcquisto.findById(req.params.id);
    if (!categoria)
      return res.status(404).json({ message: "Categoria non trovata" });
    const { descrizione } = req.body;
    if (descrizione) categoria.descrizione = descrizione;
    await categoria.save();
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};

// DELETE /api/categorie/:id - Elimina categoria (solo se non usata in richieste)
export const eliminaCategoria = async (req: Request, res: Response) => {
  try {
    if (req.user.ruolo !== "Responsabile")
      return res
        .status(403)
        .json({ message: "Solo i responsabili possono eliminare categorie" });
    const categoria = await CategoriaAcquisto.findById(req.params.id);
    if (!categoria)
      return res.status(404).json({ message: "Categoria non trovata" });
    const usata = await RichiestaAcquisto.exists({
      categoriaID: categoria._id,
    });
    if (usata)
      return res
        .status(400)
        .json({ message: "Categoria in uso in almeno una richiesta" });
    await categoria.deleteOne();
    res.json({ message: "Categoria eliminata" });
  } catch (error) {
    res.status(500).json({ message: "Errore interno del server" });
  }
};
