import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const SECRET = process.env.JWT_SECRET ?? 'fairshare-dev-secret';

function base64url(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function unsignedToken(claims: object): string {
  return `${base64url({ alg: 'none', typ: 'JWT' })}.${base64url(claims)}.`;
}

function get(path: string, token: string) {
  return request(createApp()).get(path).set('Authorization', `Bearer ${token}`);
}

describe('token verification', () => {
  it('accepts a token issued by the server', async () => {
    const app = createApp();
    const { token } = (await request(app).post('/api/session').send({ email: 'maya@fairshare.dev' })).body;
    const res = await request(app).get('/api/receipts').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('rejects an unsigned alg:none token', async () => {
    const res = await get('/api/receipts', unsignedToken({ sub: 'u_omar', role: 'member' }));
    expect(res.status).toBe(401);
  });

  it('rejects a forged alg:none admin token on admin routes', async () => {
    const res = await get('/api/admin/export-all', unsignedToken({ sub: 'u_maya', role: 'admin' }));
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'unauthorized' });
  });

  it('rejects a token signed with a different secret', async () => {
    const forged = jwt.sign({ sub: 'u_omar', role: 'admin' }, 'attacker-secret', { algorithm: 'HS256' });
    const res = await get('/api/exports/receipts/r_2001', forged);
    expect(res.status).toBe(401);
  });

  it('rejects a validly signed token whose payload was tampered with', async () => {
    const [header, , signature] = jwt.sign({ sub: 'u_maya', role: 'member' }, SECRET).split('.');
    const tampered = `${header}.${base64url({ sub: 'u_omar', role: 'admin' })}.${signature}`;
    const res = await get('/api/receipts', tampered);
    expect(res.status).toBe(401);
  });

  it('rejects an expired token', async () => {
    const expired = jwt.sign({ sub: 'u_maya', role: 'member', exp: Math.floor(Date.now() / 1000) - 60 }, SECRET);
    const res = await get('/api/receipts', expired);
    expect(res.status).toBe(401);
  });

  it('rejects a token signed with a non-HS256 algorithm', async () => {
    const hs512 = jwt.sign({ sub: 'u_maya', role: 'member' }, SECRET, { algorithm: 'HS512' });
    const res = await get('/api/receipts', hs512);
    expect(res.status).toBe(401);
  });
});
