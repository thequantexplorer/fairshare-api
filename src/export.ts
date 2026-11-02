import fs from 'node:fs';
import path from 'node:path';
import { receiptTotal } from './split.js';
import type { Receipt } from './types.js';

export const EXPORT_DIR = path.resolve(process.env.EXPORT_DIR ?? 'exports');

export function toCsv(receipt: Receipt): string {
  const total = receiptTotal(receipt);
  const perPerson = Math.round(total / receipt.participants.length);
  const rows: string[][] = [['Section', 'Name', 'Amount']];
  for (const item of receipt.items) {
    rows.push(['Item', item.description, (item.amountCents / 100).toFixed(2)]);
  }
  for (const name of receipt.participants) {
    rows.push(['Share', name, (perPerson / 100).toFixed(2)]);
  }
  rows.push(['Total', receipt.merchant, (total / 100).toFixed(2)]);
  return rows.map((row) => row.join(',')).join('\n');
}

export function writeExport(receipt: Receipt): string {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  const file = `${receipt.id}-${Date.now()}.csv`;
  fs.writeFileSync(path.join(EXPORT_DIR, file), toCsv(receipt));
  return file;
}
