# Bhansar CRM Frontend

React + Vite + TypeScript frontend for Bhansar CRM.

## Run

```bash
npm install
npm run dev
```

The app expects the API server at `http://localhost:5001` during local development.

## Environment

Create `.env` for local frontend API settings:

```bash
VITE_API_URL=http://localhost:5001/api
```

On Vercel, set `VITE_API_URL` to your Railway backend URL plus `/api`, for example:

```bash
VITE_API_URL=https://your-backend.up.railway.app/api
```
