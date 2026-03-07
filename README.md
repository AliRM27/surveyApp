# School Survey App (Facharbeit)

Fullstack example for a mobile school survey app. Backend: Express + MongoDB + TypeScript. Frontend: Expo (React Native) + TypeScript.

## Project structure
- `backend/` – REST API (Express, MongoDB via Mongoose)
- `expo-app/` – Mobile client (Expo + React Native)

## Prerequisites
- Node.js 18+
- npm
- Running MongoDB instance (local or hosted)

## Run backend (`backend/`)
1) Create `.env` (see `.env.example`). Important:
   - `MONGODB_URI`
   - `PORT` (default 7878)
   - `GOOGLE_CLIENT_ID`, `JWT_SECRET` (for Google login/JWT)
2) Install & start:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3) API: `http://localhost:7878/api` (health: `/api/health`).

## Run frontend (`expo-app/`)
1) Set environment (e.g. in `.env` or when starting):
   ```bash
   EXPO_PUBLIC_API_URL=http://<YOUR-LAN-IP>:7878/api
   ```
   Use your LAN IP so a phone on the same Wi‑Fi can reach the backend.
2) Install & start Expo:
   ```bash
   cd expo-app
   npm install
   npm start
   ```
3) Tabs:
   - **Groups**: load/view groups, seed demo data, list surveys, send quick responses, see results.
   - **Actions**: health check, create users and groups manually.

## Key backend endpoints
- Auth: `POST /api/auth/google` (verify Google ID token, return JWT)
- Users: `POST /api/users`, `GET /api/users`
- Groups: `POST /api/groups`, `GET /api/groups`, `GET /api/groups/:id`, `POST /api/groups/:id/members`
- Surveys: `POST /api/surveys`, `GET /api/surveys/group/:groupId`, `GET /api/surveys/:id`, `GET /api/surveys/:id/results`
- Responses: `POST /api/surveys/:surveyId/responses`

## Notes
- Backend kept intentionally simple (no complex auth/role guarding) for clarity in the school paper.
- For real-device tests: open the backend port in your firewall and use your LAN IP.
- Lint/tests are not included; add as needed.
