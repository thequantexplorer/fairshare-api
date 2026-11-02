import { describe, expect, it } from 'vitest';
import { toCsv } from '../src/export.js';
import { findReceipt } from '../src/store.js';

describe('toCsv', () => {
  it('writes a header row', () => {
    const csv = toCsv(findReceipt('r_1001')!);
    expect(csv.split('\n')[0]).toBe('Section,Name,Amount');
  });

  it('share rows add up to the receipt total', () => {
    const csv = toCsv(findReceipt('r_1001')!);
    const rows = csv.split('\n').map((line) => line.split(','));
    const shares = rows.filter((r) => r[0] === 'Share').reduce((sum, r) => sum + Number(r[2]), 0);
    const total = Number(rows.find((r) => r[0] === 'Total')![2]);
    expect(shares.toFixed(2)).toBe(total.toFixed(2));
  });
});
