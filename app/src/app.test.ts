import { describe, expect, it } from 'vitest';
import { app } from './app.js';

describe('API', () => {
  it('GET /api/health は status: ok を返す', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'ok' });
  });
});
