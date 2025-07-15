import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Approvazione Richieste di Acquisto API",
      version: "1.0.0",
      description: "API per la gestione delle richieste di acquisto aziendali.",
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
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const specs = swaggerJsdoc(options);
