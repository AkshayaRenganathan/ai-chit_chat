# AI Chat Bot

Full-stack AI customer support chat application using React, Node.js, Express, MongoDB Atlas, JWT authentication, and OpenRouter.

## Backend structure

```text
server/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   └── chatController.js
├── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── models/
│   ├── User.js
│   └── Chat.js
├── routes/
│   ├── authRoutes.js
│   └── chatRoutes.js
├── services/
│   ├── aiService.js
│   ├── authService.js
│   └── chatService.js
├── .env.example
├── Dockerfile
├── package.json
└── server.js
```

### Request flow

```text
Frontend
   ↓
Route
   ↓
Controller
   ↓
Service
   ↓
Model / OpenRouter
   ↓
Controller
   ↓
Frontend
```

## Run locally without Docker

### Backend

1. Go to `server`.
2. Copy `.env.example` to `.env`.
3. Fill in:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `AI_API_KEY`
   - `FRONTEND_URL=http://localhost:3000`
4. Run:

```bash
npm install
npm start
```

Backend: `http://localhost:5001`

### Frontend

The frontend defaults to `http://localhost:5001`. If required, create `client/.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:5001
```

Then:

```bash
npm install
npm start
```

Frontend: `http://localhost:3000`

## Run with Docker Compose

Create `server/.env` from `server/.env.example`, then run from the project root:

```bash
docker compose up --build
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:5001`

## Render deployment order

Deploy the backend first. Set its environment variables in Render, then copy the backend URL into the frontend's `REACT_APP_API_BASE_URL` environment variable and deploy the frontend.

Backend environment variables:

```text
MONGO_URI
JWT_SECRET
AI_API_KEY
AI_MODEL=openai/gpt-oss-20b:free
FRONTEND_URL=<frontend Render URL>
```

Frontend environment variable:

```text
REACT_APP_API_BASE_URL=<backend Render URL>
```

## Important

Never commit `.env` or API keys. Only `.env.example` should be committed.
