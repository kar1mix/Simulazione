import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Approvazione Richieste di Acquisto API",
      version: "1.0.0",
      description:
        "API per la gestione delle richieste di acquisto aziendali. Permette la registrazione e autenticazione degli utenti (Dipendente/Responsabile), la gestione delle categorie di acquisto e delle richieste di acquisto con flusso di approvazione.",
      contact: {
        name: "API Support",
        email: "support@app-acquisti.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Server di sviluppo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Utente: {
          type: "object",
          properties: {
            _id: { type: "string" },
            nome: { type: "string" },
            cognome: { type: "string" },
            email: { type: "string", format: "email" },
            ruolo: { type: "string", enum: ["Dipendente", "Responsabile"] },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["nome", "cognome", "email", "password", "ruolo"],
          properties: {
            nome: { type: "string" },
            cognome: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            ruolo: { type: "string", enum: ["Dipendente", "Responsabile"] },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        CategoriaAcquisto: {
          type: "object",
          properties: {
            _id: { type: "string" },
            descrizione: { type: "string" },
          },
        },
        RichiestaAcquisto: {
          type: "object",
          properties: {
            _id: { type: "string" },
            dataRichiesta: { type: "string", format: "date-time" },
            categoriaID: { $ref: "#/components/schemas/CategoriaAcquisto" },
            oggetto: { type: "string" },
            quantita: { type: "number" },
            costoUnitario: { type: "number" },
            motivazione: { type: "string" },
            stato: {
              type: "string",
              enum: ["In attesa", "Approvata", "Rifiutata"],
            },
            utenteID: { type: "string" },
            dataApprovazione: { type: "string", format: "date-time" },
            utenteApprovazioneID: { type: "string" },
          },
        },
      },
    },
  },
  apis: [
    "./src/routes/acquistiRoutes.ts",
    "./src/routes/utenteRoutes.ts",
    "./src/controllers/acquistiController.ts",
    "./src/controllers/utenteController.ts",
  ],
};

export const specs = swaggerJsdoc(options);
