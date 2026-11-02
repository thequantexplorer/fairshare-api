import fs from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { csvStream, toCsv } from '../src/export.js';
import { splitEvenly, receiptTotal } from '../src/split.js';
import { findReceipt } from '../src/store.js';
import type { Receipt } from '../src/types.js';

function receipt(overrides: Partial<Receipt> = {}): Receipt {
  return {
    id: 'r_test',
    ownerId: 'u_maya',
    merchant: 'Cafe',
    date: '2026-11-01',
    currency: 'USD',
    items: [{ description: 'Coffee', amountCents: 500 }],
    participants: ['Maya'],
    ...overrides,
  };
}

function shareCents(csv: string): Record<string, number> {
  const rows = csv.trimEnd().split('\n').map((line) => line.split(','));
  return Object.fromEntries(rows.filter((r) => r[0] === 'Share').map((r) => [r[1], Math.round(Number(r[2]) * 100)]));
}

async function signIn(app: ReturnType<typeof createApp>, email = 'maya@fairshare.dev') {
  const res = await request(app).post('/api/session').send({ email });
  return res.body.token as string;
}

describe('toCsv', () => {
  it('writes a header row', () => {
    const csv = toCsv(findReceipt('r_1001')!);
    expect(csv.split('\n')[0]).toBe('Section,Name,Amount');
  });

  it.each(['r_1001', 'r_1002', 'r_1003', 'r_2001'])('share rows for %s add up to the total and match splitEvenly', (id) => {
    const r = findReceipt(id)!;
    const total = receiptTotal(r);
    const shares = shareCents(toCsv(r));
    expect(shares).toEqual(splitEvenly(total, r.participants));
    expect(Object.values(shares).reduce((a, b) => a + b, 0)).toBe(total);
  });

  it('exports r_1002 remainder cents instead of dropping them', () => {
    expect(shareCents(toCsv(findReceipt('r_1002')!))).toEqual({ Maya: 14751, Omar: 14750, Lena: 14750 });
  });

  it('quotes fields containing commas, quotes and newlines', () => {
    const csv = toCsv(
      receipt({
        merchant: 'Joe\'s "Diner", SF',
        items: [{ description: 'Eggs,\nbacon', amountCents: 1200 }],
        participants: ['Chen, Maya'],
      }),
    );
    expect(csv).toBe(
      [
        'Section,Name,Amount',
        'Item,"Eggs,\nbacon",12.00',
        'Share,"Chen, Maya",12.00',
        'Total,"Joe\'s ""Diner"", SF",12.00',
        '',
      ].join('\n'),
    );
  });

  it('neutralizes spreadsheet formulas in text fields', () => {
    const csv = toCsv(receipt({ merchant: '=HYPERLINK("http://x")', items: [{ description: '+1', amountCents: 100 }], participants: ['@me'] }));
    expect(csv).toContain(`Item,'+1,1.00`);
    expect(csv).toContain(`Share,'@me,1.00`);
    expect(csv).toContain(`Total,"'=HYPERLINK(""http://x"")",1.00`);
  });
});

describe('csvStream', () => {
  it('emits the CSV one row at a time', async () => {
    const r = findReceipt('r_1001')!;
    const chunks: string[] = [];
    for await (const chunk of csvStream(r)) chunks.push(chunk as string);
    expect(chunks).toHaveLength(1 + r.items.length + r.participants.length + 1);
    expect(chunks.join('')).toBe(toCsv(r));
  });
});

describe('GET /api/exports/receipts/:id', () => {
  it('requires a token', async () => {
    const res = await request(createApp()).get('/api/exports/receipts/r_1001');
    expect(res.status).toBe(401);
  });

  it('streams the CSV as a download without writing files', async () => {
    const app = createApp();
    const token = await signIn(app);
    const exportsDir = path.resolve('exports');
    const existedBefore = fs.existsSync(exportsDir);
    const res = await request(app).get('/api/exports/receipts/r_1002').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/csv; charset=utf-8');
    expect(res.headers['content-disposition']).toBe('attachment; filename="r_1002.csv"');
    expect(res.text).toBe(toCsv(findReceipt('r_1002')!));
    expect(fs.existsSync(exportsDir)).toBe(existedBefore);
  });

  it("returns 404 for another user's receipt", async () => {
    const app = createApp();
    const token = await signIn(app);
    const res = await request(app).get('/api/exports/receipts/r_2001').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.text).not.toContain('Hardware store');
  });

  it('returns 404 for an unknown receipt', async () => {
    const app = createApp();
    const token = await signIn(app);
    const res = await request(app).get('/api/exports/receipts/r_missing').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'not found' });
  });

  it('no longer serves files from the export directory', async () => {
    const app = createApp();
    const token = await signIn(app);
    const res = await request(app).get('/api/exports/r_2001-1.csv').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
