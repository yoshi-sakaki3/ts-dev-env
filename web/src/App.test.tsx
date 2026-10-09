import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App.tsx';

// API の代わりに、決まった答えを返す fetch を使う（サーバーなしでテストできる）
function mockFetch(routes: Record<string, () => Response>) {
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const key = `${init?.method ?? 'GET'} ${String(input)}`;
    const route = routes[key];
    if (!route) throw new Error(`想定外の呼び出し: ${key}`);
    return route();
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

afterEach(() => vi.unstubAllGlobals());

describe('メモの画面', () => {
  it('API から読んだメモを一覧に出す', async () => {
    mockFetch({
      'GET /api/notes': () =>
        json([{ id: 1, body: '見積もりを送る', createdAt: '2026-10-09T00:00:00Z' }]),
    });
    render(<App />);
    expect(await screen.findByText('見積もりを送る')).toBeInTheDocument();
  });

  it('保存すると一覧の先頭に追加し、入力欄を空にする', async () => {
    const fetchFn = mockFetch({
      'GET /api/notes': () => json([]),
      'POST /api/notes': () =>
        json({ id: 2, body: '電話をかけ直す', createdAt: '2026-10-09T01:00:00Z' }, 201),
    });
    render(<App />);
    await screen.findByText('まだメモがありません。');

    const input = screen.getByLabelText('新しいメモ');
    fireEvent.change(input, { target: { value: '  電話をかけ直す  ' } });
    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    expect(await screen.findByText('電話をかけ直す')).toBeInTheDocument();
    expect(input).toHaveValue('');
    const sent = fetchFn.mock.calls[1]?.[1]?.body;
    expect(JSON.parse(String(sent))).toEqual({ body: '電話をかけ直す' });
  });

  it('空のときは保存ボタンを押せない', async () => {
    mockFetch({ 'GET /api/notes': () => json([]) });
    render(<App />);
    await screen.findByText('まだメモがありません。');
    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled();
  });

  it('API のエラーを画面に出す', async () => {
    mockFetch({ 'GET /api/notes': () => json({ error: 'DB に接続できません' }, 500) });
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent('DB に接続できません');
  });
});
