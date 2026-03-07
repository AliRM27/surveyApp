# School Survey Backend

Express + TypeScript + MongoDB backend for the survey mobile app used in the Facharbeit project.

## Quick start

1. Copy env template and update values:
   ```bash
   cp .env.example .env
   # adjust MONGODB_URI if needed
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in dev mode:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build && npm start
   ```

## API routes (prefix `/api`)

- `GET /health` – simple health check.
- **Auth**
  - `POST /auth/google` – send `{ idToken, role? }` from Expo Google sign-in; verifies with Google, upserts user, returns JWT + profile.
- **Users**
  - `POST /users` – create user `{ name, email, role }`.
  - `GET /users` – list all users.
- **Groups**
  - `POST /groups` – create group `{ name, teacherId, memberIds? }`.
  - `GET /groups` – list groups (optional `?teacherId=` filter).
  - `GET /groups/:id` – group detail.
  - `POST /groups/:id/members` – add student to group `{ memberId }`.
- **Surveys**
  - `POST /surveys` – create survey `{ title, groupId, createdBy, anonymous?, questions[] }`.
  - `GET /surveys/group/:groupId` – list surveys for a group.
  - `GET /surveys/:id` – survey detail.
  - `GET /surveys/:id/results` – aggregated results.
- **Responses**
  - `POST /surveys/:surveyId/responses` – submit answers `{ userId?, answers[] }`.

## Folder structure

```
src/
  app.ts              // Express setup
  index.ts            // server start + DB connection
  config/             // env + Mongo connection
  controllers/        // route handlers
  models/             // Mongoose schemas
  routes/             // route definitions
  middlewares/        // validation, error handling
  utils/              // small helpers
```

## Notes

- Validation uses **zod** via `validateRequest`.
- Auth uses Google ID tokens; set `GOOGLE_CLIENT_ID` and `JWT_SECRET` in your `.env`.
- For non-anonymous surveys, `userId` is required when submitting a response.
- Result endpoint summarizes:
  - multiple choice → counts per option
  - scale → min/max/average
  - text → list of submitted answers
