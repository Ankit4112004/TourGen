# BiharChale Deployment

## Frontend

Deploy `client` as a Vite static app.

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://your-api-host.com/api`

## Backend

Deploy `server` as a Node service.

- Start command: `npm start`
- Health check path: `/health`
- Environment variables:
  - `PORT`
  - `CLIENT_ORIGIN=https://your-frontend-host.com`
  - `USE_AI_WORKFLOW=false`

The default planner does not need external AI, Postgres, or Redis. Set `USE_AI_WORKFLOW=true` only after configuring `MISTRAL_API_KEY`, `DATABASE_URL`, and `REDIS_URL`.
