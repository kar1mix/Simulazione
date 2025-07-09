import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Torneo Ping-Pong Aziendale API",
      version: "1.0.0",
      description: "API per la gestione di un torneo aziendale di ping-pong",
      contact: {
        name: "API Support",
        email: "support@torneo-ping-pong.com",
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
            iscrittoAlTorneo: { type: "boolean" },
            organizzatoreDelTorneo: { type: "boolean" },
          },
        },
        Incontro: {
          type: "object",
          properties: {
            _id: { type: "string" },
            giocatore1: { $ref: "#/components/schemas/Utente" },
            giocatore2: { $ref: "#/components/schemas/Utente" },
            dataIncontro: { type: "string", format: "date-time" },
            stato: {
              type: "string",
              enum: ["programmato", "completato"],
            },
            risultato: {
              type: "object",
              properties: {
                punteggioGiocatore1: { type: "number", minimum: 0 },
                punteggioGiocatore2: { type: "number", minimum: 0 },
              },
            },
          },
        },
        ClassificaItem: {
          type: "object",
          properties: {
            giocatore: { $ref: "#/components/schemas/Utente" },
            partiteGiocate: { type: "number" },
            vittorie: { type: "number" },
            sconfitte: { type: "number" },
            punti: { type: "number" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["nome", "cognome", "email", "password"],
          properties: {
            nome: { type: "string" },
            cognome: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
        NuovoIncontro: {
          type: "object",
          required: ["giocatore1", "giocatore2", "dataIncontro"],
          properties: {
            giocatore1: { type: "string" },
            giocatore2: { type: "string" },
            dataIncontro: { type: "string", format: "date-time" },
          },
        },
        RisultatoIncontro: {
          type: "object",
          required: ["punteggioGiocatore1", "punteggioGiocatore2"],
          properties: {
            punteggioGiocatore1: { type: "number", minimum: 0 },
            punteggioGiocatore2: { type: "number", minimum: 0 },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const specs = swaggerJsdoc(options);
