import { Readable } from 'node:stream';
import { receiptTotal, splitEvenly } from './split.js';
import type { Receipt } from './types.js';

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function money(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Neutralizes spreadsheet formulas in free-text fields (OWASP CSV injection guidance). */
function text(value: string): string {
  return FORMULA_PREFIX.test(value) ? `'${value}` : value;
}

export function csvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function* csvRows(receipt: Receipt): Generator<string> {
  const total = receiptTotal(receipt);
  const row = (...fields: string[]) => `${fields.map(csvField).join(',')}\n`;
  yield row('Section', 'Name', 'Amount');
  for (const item of receipt.items) {
    yield row('Item', text(item.description), money(item.amountCents));
  }
  for (const [name, cents] of Object.entries(splitEvenly(total, receipt.participants))) {
    yield row('Share', text(name), money(cents));
  }
  yield row('Total', text(receipt.merchant), money(total));
}

export function toCsv(receipt: Receipt): string {
  return [...csvRows(receipt)].join('');
}

export function csvStream(receipt: Receipt): Readable {
  return Readable.from(csvRows(receipt));
}
