# 🛒 Approvazione Richieste di Acquisto

Applicazione web full-stack per la gestione, approvazione e monitoraggio delle richieste di acquisto aziendali. Backend Node.js/Express/MongoDB, frontend Angular.

## 🚀 Funzionalità

### Per tutti gli utenti:

- **Registrazione e Login** con autenticazione JWT

### Per Dipendenti:

- **Creazione richiesta di acquisto** (form con validazione)
- **Visualizzazione, modifica ed eliminazione** delle proprie richieste (solo se in attesa)

### Per Responsabili:

- **Visualizzazione e gestione** di tutte le richieste (approva/rifiuta/elimina)
- **Gestione categorie di acquisto** (aggiunta, modifica, eliminazione)
- **Statistiche aggregate** per mese/categoria (tabella e grafico)

## 🛠️ Stack Tecnologico

### Backend

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT per autenticazione
- Swagger per documentazione API

### Frontend

- Angular 17 + TypeScript
- UI custom moderna e responsive
- Reactive Forms, animazioni, feedback utente

## 📁 Struttura del Progetto

```
├── backend/
│   ├── src/
│   │   ├── models/           # Utente, RichiestaAcquisto, CategoriaAcquisto
│   │   ├── controllers/      # utenteController, acquistiController
│   │   ├── routes/           # utenteRoutes, acquistiRoutes
│   │   ├── middlewares/      # auth, requireRole, validateInput
│   │   ├── config/           # swagger.ts
│   │   └── app.ts
│   └── package.json
├── frontend/
│   ├── src/app/
│   │   ├── core/services/    # auth, richieste, categorie, statistiche
│   │   ├── features/
│   │   │   ├── auth/         # login, registrazione
│   │   │   ├── dashboard/    # dashboard dipendente/responsabile
│   │   │   └── statistiche/  # pagina statistiche
│   │   └── shared/components # navbar
│   └── package.json
└── README.md
```

## ⚡ Installazione e Avvio

### Prerequisiti

- Node.js (18+)
- MongoDB
- npm o yarn

### Backend

```bash
cd backend
npm install
# Crea file .env con:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/app-acquisti
JWT_SECRET=your-super-secret-jwt-key
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

- Frontend: http://localhost:4200
- Backend API: http://localhost:5000

## 📊 API Endpoints principali

### Autenticazione

- `POST /api/utenti/register` - Registrazione
- `POST /api/utenti/login` - Login
- `GET /api/utenti/profile` - Profilo utente

### Richieste di acquisto

- `GET /api/richieste` - Elenco richieste (proprie o tutte)
- `POST /api/richieste` - Crea richiesta
- `PUT /api/richieste/:id` - Modifica richiesta
- `DELETE /api/richieste/:id` - Elimina richiesta
- `PUT /api/richieste/:id/approva` - Approva richiesta
- `PUT /api/richieste/:id/rifiuta` - Rifiuta richiesta

### Categorie

- `GET /api/categorie` - Elenco categorie
- `POST /api/categorie` - Crea categoria
- `PUT /api/categorie/:id` - Modifica categoria
- `DELETE /api/categorie/:id` - Elimina categoria

### Statistiche

- `GET /api/statistiche/richieste` - Statistiche aggregate per mese/categoria (solo responsabili)

## 📝 Documentazione API (Swagger)

- Disponibile su: `http://localhost:5000/api-docs`
- Tutte le rotte, parametri, request/response e security documentate

## 🎨 UI/UX

- Design moderno, responsive, animazioni e feedback chiari
- Navbar con accesso rapido alle sezioni (dashboard, statistiche)
- Tabelle, card, modali e grafici coerenti

## 🛡️ Sicurezza

- JWT per autenticazione
- Validazione input lato server e client
- Controllo ruoli per endpoint protetti

## 🧪 Testing

- Testabili via Postman, Swagger, Thunder Client

## 📈 Flusso Utente

1. Registrazione → Login
2. Dipendente: crea/modifica/elimina richieste
3. Responsabile: gestisce richieste/categorie/statistiche

## 📄 Licenza

Progetto dimostrativo per gestione richieste di acquisto aziendali.
