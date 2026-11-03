import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { issueToken, requireAdmin, requireUser } from './auth.js';
import { adminRouter } from './routes/admin.js';
import { exportsRouter } from './routes/exports.js';
import { receiptsRouter } from './routes/receipts.js';
import { users } from './store.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(root, 'public')));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  // Demo sign-in: the dashboard signs in as the seeded user.
  app.post('/api/session', (req, res) => {
    const user = users.find((u) => u.email === req.body?.email);
    if (!user) return res.status(401).json({ error: 'unknown user' });
    res.json({ token: issueToken(user), user: { id: user.id, name: user.name } });
  });

  app.use('/api/receipts', requireUser, receiptsRouter);
  app.use('/api/exports', requireUser, exportsRouter);
  app.use('/api/admin', requireUser, requireAdmin, adminRouter);
  return app;
}
