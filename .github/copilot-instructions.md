# Copilot / AI Agent Instructions — Foodbacked

Purpose: give an AI coding agent the minimum, actionable context to be productive in this repository.

- Big picture:

  - Frontend: React + Vite app in `frontend/` served with `npm run dev` (Local: http://localhost:5173). See [frontend/package.json](frontend/package.json#L1-L40).
  - Backend: Express app in `Backend/` (app exported from [Backend/src/app.js](Backend/src/app.js#L1-L40), server started in [Backend/server.js](Backend/server.js#L1-L80)) listening on port 3000.
  - Database: MongoDB via Mongoose; models live under `Backend/src/models/` (User, Vendor, Admin).
  - API surface: REST under `/api/*` (auth, user, admin, payment, food, support). Routes are registered in `Backend/src/app.js`.

- Quick dev commands (what to run locally):

  - Start backend: `cd Backend && npm start` (see [README.md](README.md#L90-L110)).
  - Start frontend: `cd frontend && npm run dev`.
  - MongoDB: run `mongod` or connect to a running service; server seeds a dev admin using env vars in `Backend/server.js`.

- Important conventions and patterns (discoverable in code):

  - Authentication: JWT tokens stored in HTTP-only cookies; middleware under `Backend/src/middlewares` enforces protected routes.
  - CORS: allowed origins are listed in `app.js` (localhost:5173, 5175) — avoid changing origins unless you update frontend dev server config.
  - Route patterns: admin routes often prefix with `/api/admin` or `/api/user/admin/*` (see examples in `frontend/src/AdminSubscription.jsx` where admin subscription and vendor status APIs are called).
  - API client: frontend uses a central `apiClient` (inspect `frontend/src/config/api`) — update this rather than sprinkling axios configs.
  - Dev seeding: `Backend/server.js` creates a default admin when DB connects; use env vars `DEV_ADMIN_EMAIL` / `DEV_ADMIN_PASS` for override.

- Editing guidance for agents:

  - Make minimal, focused edits. Preserve existing route names and request payload shapes (client-side code depends on them).
  - When changing an API endpoint path or request body, update both backend route and all consuming frontend calls (search for the endpoint string).
  - Keep server port (3000) and frontend dev port (5173) unless you update CORS origins and README dev commands.

- Examples to reference when making changes:

  - Create subscription (frontend → backend): `apiClient.post('/api/payment/subscription/admin/create', payload)` — see [frontend/src/AdminSubscription.jsx](frontend/src/AdminSubscription.jsx#L1-L220).
  - Update vendor status: `apiClient.put('/api/user/admin/vendors/${selectedVendor}/status', { status })` — see `AdminSubscription.jsx`.
  - Routes registration and CORS origins: [Backend/src/app.js](Backend/src/app.js#L1-L80).

- Testing & linting:

  - Frontend lint: `cd frontend && npm run lint`.
  - There are no automated test scripts in the repo root; run the dev servers and exercise flows manually or add small integration tests that call the HTTP endpoints.

- What NOT to change without human approval:
  - JWT handling, cookie names, and authentication middleware behavior.
  - Database model schemas under `Backend/src/models/` (breaking changes will affect all clients).
  - Default dev ports and CORS origins unless you update README/dev scripts.

If any section here is unclear or you need more examples (e.g., exact model fields or sampe API responses), tell me what area to expand and I will iterate.
