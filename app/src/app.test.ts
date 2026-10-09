import pg from 'pg';
import { describe, expect, it } from 'vitest';
import { app } from './app.js';

describe('API', () => {
  it('GET /api/health は status: ok を返す', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'ok' });
  });

  it('POST /api/notes は空のメモを 400 で断る', async () => {
    const res = await app.request('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: '   ' }),
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/notes で保存したメモが GET /api/notes の先頭に出る（DB を使う）', async () => {
    const text = `テスト ${Date.now()}`;
    const created = await app.request('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: text }),
    });
    expect(created.status).toBe(201);
    const { id } = (await created.json()) as { id: number };
    try {
      const list = (await (await app.request('/api/notes')).json()) as { body: string }[];
      expect(list[0]?.body).toBe(text);
    } finally {
      // 開発用の DB にテストのデータを残さない
      const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
      await db.connect();
      await db.query('DELETE FROM notes WHERE id = $1', [id]);
      await db.end();
    }
  });
});
