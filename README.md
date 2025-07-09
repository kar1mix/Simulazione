# 🏓 Torneo Ping-Pong Aziendale

Un'applicazione web full-stack per la gestione di un torneo aziendale di ping-pong, sviluppata con Node.js/Express (backend) e Angular (frontend).

## 🚀 Funzionalità

### Per tutti gli utenti:

- **Registrazione e Login** con autenticazione JWT
- **Iscrizione al torneo** - qualsiasi utente può iscriversi
- **Diventare organizzatore** - qualsiasi utente può diventare organizzatore

### Per gli iscritti al torneo:

- **Visualizzazione partecipanti** - lista di tutti gli iscritti
- **Visualizzazione incontri** - calendario degli incontri con stati e risultati
- **Classifica** - ranking basato su percentuale vittorie (minimo 5 partite per essere qualificati)

### Per gli organizzatori:

- **Gestione incontri** - creazione, modifica, eliminazione
- **Registrazione risultati** - inserimento punteggi con validazione regole ping-pong

## 🛠️ Stack Tecnologico

### Backend

- **Node.js** con **Express** e **TypeScript**
- **MongoDB** con **Mongoose** per il database
- **JWT** per l'autenticazione
- **Bcrypt** per l'hashing delle password
- **CORS** per la gestione delle richieste cross-origin

### Frontend

- **Angular 17** con **TypeScript**
- **Angular Material** per l'UI
- **Reactive Forms** per la gestione dei form
- **HTTP Client** per le chiamate API

## 📋 Regole Ping-Pong Implementate

- **Vincitore**: chi arriva a 11 punti (se l'avversario ha meno di 10)
- **Deuce**: se entrambi hanno 10+ punti, vince chi supera l'avversario di 2 punti
- **Nessun pareggio** ammesso
- **Punteggi negativi** non ammessi

## 🏗️ Struttura del Progetto

```
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Utente.ts          # Modello utente con iscrizione/organizzatore
│   │   │   └── Incontro.ts        # Modello incontro con validazioni
│   │   ├── controllers/
│   │   │   ├── utenteController.ts # Gestione utenti e autenticazione
│   │   │   └── incontroController.ts # Gestione incontri e classifica
│   │   ├── routes/
│   │   │   ├── utenteRoutes.ts    # Routes per utenti
│   │   │   └── torneoRoutes.ts    # Routes per torneo
│   │   ├── middlewares/
│   │   │   ├── auth.ts            # Middleware autenticazione JWT
│   │   │   └── requireRole.ts     # Middleware controllo ruoli
│   │   └── app.ts                 # Configurazione Express
│   └── package.json
├── frontend/
│   ├── src/app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts    # Servizio autenticazione
│   │   │   │   └── torneo.service.ts  # Servizio torneo
│   │   │   └── guards/
│   │   │       └── auth.guard.ts      # Guard autenticazione
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/             # Componente login
│   │   │   │   └── register/          # Componente registrazione
│   │   │   └── dashboard/
│   │   │       └── dashboard.component.ts # Dashboard principale
│   │   └── app.routes.ts              # Configurazione routing
│   └── package.json
└── README.md
```

## 🚀 Installazione e Avvio

### Prerequisiti

- Node.js (versione 18+)
- MongoDB (locale o cloud)
- npm o yarn

### Backend

1. **Installa le dipendenze:**

```bash
cd backend
npm install
```

2. **Configura le variabili d'ambiente:**
   Crea un file `.env` nella cartella `backend`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/torneo-ping-pong
JWT_SECRET=your-super-secret-jwt-key
```

3. **Avvia il server:**

```bash
npm run dev
```

Il backend sarà disponibile su `http://localhost:5000`

### Frontend

1. **Installa le dipendenze:**

```bash
cd frontend
npm install
```

2. **Avvia l'applicazione:**

```bash
npm start
```

Il frontend sarà disponibile su `http://localhost:4200`

## 📡 API Endpoints

### Autenticazione

- `POST /api/utenti/register` - Registrazione nuovo utente
- `POST /api/utenti/login` - Login utente

### Torneo (richiede autenticazione)

- `POST /api/torneo/iscriviti` - Iscrizione al torneo
- `POST /api/torneo/sono-un-organizzatore` - Diventare organizzatore
- `GET /api/torneo/partecipanti` - Lista partecipanti (solo iscritti)
- `GET /api/torneo/incontri` - Lista incontri (solo iscritti)
- `GET /api/torneo/classifica` - Classifica (solo iscritti)

### Gestione Incontri (solo organizzatori)

- `POST /api/torneo/incontri` - Crea nuovo incontro
- `PUT /api/torneo/incontri/:id` - Modifica incontro
- `DELETE /api/torneo/incontri/:id` - Elimina incontro

## 🔐 Sicurezza

- **JWT** per l'autenticazione con scadenza 8 ore
- **Bcrypt** per l'hashing delle password
- **Validazione input** lato server
- **Controllo ruoli** per endpoint protetti
- **CORS** configurato per sicurezza

## 🎨 UI/UX

- **Design responsive** con Angular Material
- **Navigazione a tab** per organizzare le funzionalità
- **Feedback visivo** per stati e azioni
- **Tabelle interattive** per dati strutturati
- **Colori semantici** per stati (verde=giocato, arancione=da giocare)

## 🧪 Testing

Per testare le API, puoi utilizzare:

- **Postman** o **Insomnia**
- **Swagger** (da implementare come bonus)
- **Thunder Client** (estensione VS Code)

## 🔄 Flusso Utente

1. **Registrazione** → Crea account con nome, cognome, email, password
2. **Login** → Accedi con email e password
3. **Iscrizione** → Iscriviti al torneo (pulsante nella dashboard)
4. **Visualizzazione** → Vedi partecipanti, incontri, classifica
5. **Organizzatore** → Diventa organizzatore per gestire incontri
6. **Gestione** → Crea, modifica, elimina incontri e registra risultati

## 🎯 Prossimi Sviluppi

- [ ] Dialog per creazione/modifica incontri
- [ ] Dialog per registrazione risultati
- [ ] Notifiche push per nuovi incontri
- [ ] Export classifica in PDF
- [ ] Statistiche avanzate
- [ ] Swagger documentation
- [ ] Test unitari e di integrazione

## 📝 Licenza

Questo progetto è sviluppato per scopi educativi e dimostrativi.
