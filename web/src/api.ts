// API（Hono・http://localhost:3000）を呼ぶ関数。開発中は Vite が /api を転送する
export type Note = { id: number; body: string; createdAt: string };

export const NOTE_MAX = 200;

async function readJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? `API エラー（${res.status}）`);
  }
  return (await res.json()) as T;
}

export async function fetchNotes(): Promise<Note[]> {
  return readJson<Note[]>(await fetch('/api/notes'));
}

export async function createNote(body: string): Promise<Note> {
  const res = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });
  return readJson<Note>(res);
}
