import { Router } from 'express';
import { findReceipt, receiptsFor } from '../store.js';
import { formatCents, receiptTotal, splitEvenly } from '../split.js';
import type { Receipt } from '../types.js';

export const receiptsRouter = Router();

function summarize(receipt: Receipt) {
  const total = receiptTotal(receipt);
  return {
    id: receipt.id,
    merchant: receipt.merchant,
    date: receipt.date,
    currency: receipt.currency,
    totalCents: total,
    total: formatCents(total, receipt.currency),
    shares: splitEvenly(total, receipt.participants),
  };
}

receiptsRouter.get('/', (req, res) => {
  res.json(receiptsFor(req.user!.sub).map(summarize));
});

receiptsRouter.get('/:id', (req, res) => {
  const receipt = findReceipt(req.params.id);
  if (!receipt || receipt.ownerId !== req.user!.sub) return res.status(404).json({ error: 'not found' });
  res.json({ ...summarize(receipt), items: receipt.items, participants: receipt.participants });
});
