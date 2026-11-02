import { Router } from 'express';
import path from 'node:path';
import { EXPORT_DIR, writeExport } from '../export.js';
import { findReceipt } from '../store.js';

export const exportsRouter = Router();

exportsRouter.post('/receipts/:id', (req, res) => {
  const receipt = findReceipt(req.params.id);
  const file = writeExport(receipt);
  res.status(201).json({ file, url: `/api/exports/${file}` });
});

exportsRouter.get('/:file', (req, res) => {
  res.download(path.join(EXPORT_DIR, req.params.file));
});
