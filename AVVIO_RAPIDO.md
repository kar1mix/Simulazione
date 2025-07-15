# 🚀 Avvio Rapido - Approvazione Richieste di Acquisto

## Prerequisiti

- Node.js (18+)
- MongoDB in esecuzione
- npm o yarn

## ⚡ Avvio Veloce

### 1. Backend

```bash
cd backend
npm install
# Crea file .env con le variabili d'ambiente
echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/app-acquisti
JWT_SECRET=your-secret-key" > .env
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
- Backend API & Swagger: http://localhost:5000

## 📝 Primi Passi

1. Registra un nuovo account come Dipendente o Responsabile
2. Login
3. Dipendente: crea/modifica/elimina richieste
4. Responsabile: gestisci richieste, categorie, visualizza statistiche

## 🛠️ API Docs (Swagger)

- Documentazione interattiva su http://localhost:5000/api-docs
- Tutte le rotte, parametri, request/response e security documentate

## 🛡️ Risoluzione Problemi

### MongoDB non connesso

```bash
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

Aggiungi richieste/categorie tramite l'app oppure crea dati di esempio con uno script seed (se disponibile).
