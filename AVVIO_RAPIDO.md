# 🚀 Avvio Rapido - Torneo Ping-Pong Aziendale

## Prerequisiti

- Node.js (versione 18+)
- MongoDB in esecuzione
- npm o yarn

## ⚡ Avvio Veloce

### 1. Backend

```bash
cd backend
npm install
# Crea file .env con le variabili d'ambiente
echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/torneo-ping-pong
JWT_SECRET=your-secret-key" > .env
# Popola il database con dati di esempio
npm run seed
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

## 🌐 Accesso

- Frontend: http://localhost:4200
- Backend API: http://localhost:5000

## 📝 Primi Passi

1. Registra un nuovo account OPPURE usa i dati di esempio:
   - **Organizzatori**: luca@azienda.com / password123, sara@azienda.com / password123
   - **Partecipanti**: mario@azienda.com / password123, giulia@azienda.com / password123
   - **Non iscritto**: anna@azienda.com / password123
2. Fai login
3. Iscriviti al torneo (se non sei già iscritto)
4. Diventa organizzatore (opzionale)
5. Inizia a gestire il torneo!

## 🔧 Risoluzione Problemi

### MongoDB non connesso

```bash
# Avvia MongoDB (se installato localmente)
mongod
```

### Porte occupate

- Cambia `PORT=5001` nel file `.env` del backend
- Aggiorna `apiUrl` in `frontend/src/environments/environment.ts`

### Dipendenze mancanti

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Database vuoto

```bash
cd backend
npm run seed
```
