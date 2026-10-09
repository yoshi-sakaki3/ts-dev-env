import { useEffect, useState, type FormEvent } from 'react';
import { createNote, fetchNotes, NOTE_MAX, type Note } from './api.ts';

const timeFormat = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'short', timeStyle: 'short' });

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** メモの一覧と追加（React → API → PostgreSQL がつながっているかを確かめる見本） */
export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotes()
      .then(setNotes)
      .catch((e: unknown) => setError(`読み込めませんでした：${message(e)}`))
      .finally(() => setLoading(false));
  }, []);

  const body = text.trim();
  const canSave = body.length > 0 && body.length <= NOTE_MAX && !saving;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError('');
    try {
      const note = await createNote(body);
      setNotes((prev) => [note, ...prev]);
      setText('');
    } catch (err) {
      setError(`保存できませんでした：${message(err)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <h1>メモ</h1>
      <p className="mute">
        React（Vite）の画面から API を呼び、PostgreSQL に保存する見本です。
        <a href="http://localhost:3000">環境チェック画面</a>
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="note">新しいメモ</label>
        <textarea
          id="note"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="例：見積もりを送る"
        />
        <div className="row">
          <span className={body.length > NOTE_MAX ? 'ng' : 'mute'}>
            {body.length} / {NOTE_MAX} 文字
          </span>
          <button type="submit" disabled={!canSave}>
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="ng">
          {error}
        </p>
      )}

      <section aria-label="メモの一覧">
        {loading ? (
          <p className="mute">読み込み中…</p>
        ) : notes.length === 0 ? (
          <p className="mute">まだメモがありません。</p>
        ) : (
          <ul>
            {notes.map((n) => (
              <li key={n.id}>
                <p>{n.body}</p>
                <time className="mute" dateTime={n.createdAt}>
                  {timeFormat.format(new Date(n.createdAt))}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
