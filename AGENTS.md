# Fairshare API: agent instructions

- Node 22, TypeScript strict mode. Start the server with `npm start` (http://localhost:3000); the dashboard is served from `public/`.
- Before opening or updating a pull request, run all three checks and make sure they pass: `npm run lint`, `npm run typecheck`, `npm test`.
- Money is stored as integer cents. Never round floats per share; use `splitEvenly` so shares add back up to the total.
- Every bug fix ships with a regression test in `test/`.
- UI changes to `public/` must be verified in a browser with the demo user `maya@fairshare.dev`.
