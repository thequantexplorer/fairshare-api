# Fairshare API

Shared-expense backend and web dashboard for the Fairshare apps (iOS client: `fairshare-ios`).

```sh
npm install
npm start        # http://localhost:3000, demo user maya@fairshare.dev
npm run lint && npm run typecheck && npm test
```

Endpoints: `POST /api/session`, `GET /api/receipts`, `GET /api/receipts/:id`, `GET /api/admin/export-all` (admin).
