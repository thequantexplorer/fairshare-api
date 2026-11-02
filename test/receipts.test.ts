import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

async function signIn(app: ReturnType<typeof createApp>, email = 'maya@fairshare.dev') {
  const res = await request(app).post('/api/session').send({ email });
  return res.body.token as string;
}

describe('receipts API', () => {
  it('requires a token', async () => {
    const res = await request(createApp()).get('/api/receipts');
    expect(res.status).toBe(401);
  });

  it("lists only the signed-in user's receipts", async () => {
    const app = createApp();
    const token = await signIn(app);
    const res = await request(app).get('/api/receipts').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.map((r: { id: string }) => r.id)).toEqual(['r_1001', 'r_1002', 'r_1003']);
  });

  it("hides other users' receipts", async () => {
    const app = createApp();
    const token = await signIn(app);
    const res = await request(app).get('/api/receipts/r_2001').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
