import { Router } from 'express';
import { receipts, users } from '../store.js';

export const adminRouter = Router();

// Support tooling: full account export used by the help desk.
adminRouter.get('/export-all', (_req, res) => {
  res.json({
    users: users.map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role })),
    receipts,
  });
});
