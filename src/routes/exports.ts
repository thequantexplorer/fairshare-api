import { Router } from 'express';
import { pipeline } from 'node:stream/promises';
import { csvStream } from '../export.js';
import { findReceipt } from '../store.js';

export const exportsRouter = Router();

exportsRouter.get('/receipts/:id', async (req, res, next) => {
  const receipt = findReceipt(req.params.id);
  if (!receipt || receipt.ownerId !== req.user!.sub) return res.status(404).json({ error: 'not found' });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.attachment(`${receipt.id}.csv`);
  try {
    await pipeline(csvStream(receipt), res);
  } catch (err) {
    next(err);
  }
});
