import { Hono } from 'hono';
import { html, raw } from 'hono/html';
import nodemailer from 'nodemailer';
import pg from 'pg';

/**
 * 環境チェック画面（http://localhost:3000）と API のサンプル。
 * Node.js・DB 接続・メール送信が動くかを1画面で確かめる。
 */
export const app = new Hono();

async function checkDb(): Promise<{ ok: boolean; detail: string }> {
  const url = process.env.DATABASE_URL;
  if (!url) return { ok: false, detail: 'DATABASE_URL が設定されていません' };
  const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 3000 });
  try {
    await client.connect();
    const res = await client.query<{ version: string }>('SELECT version()');
    return { ok: true, detail: res.rows[0]?.version.split(' on ')[0] ?? '' };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : String(e) };
  } finally {
    await client.end().catch(() => undefined);
  }
}

app.get('/api/health', (c) => c.json({ status: 'ok', node: process.version }));

app.post('/mail', async (c) => {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'mailpit',
    port: Number(process.env.SMTP_PORT ?? 1025),
  });
  await transport.sendMail({
    from: 'dev@example.com',
    to: 'test@example.com',
    subject: 'テストメール',
    text: `TypeScript 開発環境からのテスト送信です。\n${new Date().toISOString()}`,
  });
  return c.redirect('/?mail=sent');
});

app.get('/', async (c) => {
  const db = await checkDb();
  const sent = c.req.query('mail') === 'sent';
  return c.html(html`<!doctype html>
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>TypeScript 開発環境チェック</title>
        <style>
          ${raw(`body{font-family:system-ui,"Hiragino Sans","Yu Gothic UI",sans-serif;background:#f6f8fa;color:#1f2328;margin:0}
          main{max-width:760px;margin:0 auto;padding:24px 16px 48px}
          h1{font-size:1.4rem;border-left:6px solid #b8860b;padding-left:10px}
          section{background:#fff;border:1px solid #d1d9e0;border-radius:8px;padding:16px;margin:16px 0}
          h2{font-size:1.05rem;margin:0 0 8px}.ok{color:#1a7f37;font-weight:600}.ng{color:#cf222e;font-weight:600}
          .mute{color:#59636e;font-size:.9rem}button{font:inherit;padding:6px 14px;border-radius:6px;border:1px solid #d1d9e0;background:#fff;cursor:pointer}`)}
        </style>
      </head>
      <body>
        <main>
          <h1>TypeScript 開発環境チェック</h1>
          <section>
            <h2>Node.js</h2>
            <p class="ok">Node.js ${process.version}</p>
            <p class="mute">API の例：<a href="/api/health">/api/health</a></p>
          </section>
          <section>
            <h2>データベース（PostgreSQL）</h2>
            <p class="${db.ok ? 'ok' : 'ng'}">${db.ok ? '接続できました' : '接続できません'}</p>
            <p class="mute">${db.detail}</p>
          </section>
          <section>
            <h2>メール</h2>
            <form method="post" action="/mail"><button type="submit">テストメールを送る</button></form>
            ${sent ? html`<p>送信しました。Mailpit（http://localhost:8026）で確認できます。</p>` : ''}
            <p class="mute">送ったメールは外部には出ず、<a href="http://localhost:8026">Mailpit</a>に届きます。</p>
          </section>
        </main>
      </body>
    </html>`);
});
