# Gravitas

Gravitas is a local React/Vite frontend with an Express backend for the Grid Share simulation.

## Requirements

- Node.js 18 or newer
- npm
- A Gemini API key is optional for the basic simulation. Agent features need one.

## Setup

Clone the repository, then install dependencies in both applications:

```powershell
cd gravitas\backend
npm install
Copy-Item .env.example .env

cd ..\frontend
npm install
Copy-Item .env.example .env
```

If using Command Prompt instead of PowerShell, copy the files with:

```bat
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

The default local settings already connect the frontend to `http://localhost:5000/api`.
If the backend port or URL is changed, update `frontend\.env` (`VITE_API_URL`) and
`backend\.env` (`PORT` and `FRONTEND_URL`) to match.

## Run locally

Open two terminals from the repository root:

**Terminal 1 - backend**

```powershell
cd backend
npm start
```

The API runs at `http://localhost:5000`.

**Terminal 2 - frontend**

```powershell
cd frontend
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Verification

From `frontend`, run:

```powershell
npm run build
npm run lint
```

To run the backend API smoke test, start the backend first and then run this from
`backend` in another terminal:

```powershell
node smokeTest.js
```

## Environment files

Commit only `.env.example` files. Do not commit `.env` files or API keys.
