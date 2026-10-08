# TypeScript 開発環境（Docker Compose + Dev Containers）

Docker Compose と VS Code Dev Containers で動く、TypeScript（Node.js）の開発環境です。
コマンド1つで、Node.js・PostgreSQL・メール確認がそろいます。Windows（PowerShell）向けの操作コマンド `dev.ps1` 付き。

動作確認済み（2026-10-09）：Windows 11 + Docker Desktop で、環境チェック画面・API・型チェック・ESLint・Vitest・メール送信（Mailpit）・保存時の自動再起動。

| 画面 | URL | 用途 |
|---|---|---|
| アプリ | http://localhost:3000 | 環境チェック画面（Hono の Web アプリ） |
| API の例 | http://localhost:3000/api/health | JSON を返す API |
| Mailpit | http://localhost:8026 | アプリが送ったメールを受け止めて表示（外部には送られない） |

## 入っているもの

- Node.js 24 ＋ pnpm（corepack）
- TypeScript 6（strict）、tsx（保存すると自動で再起動）
- Web フレームワーク：Hono（軽量・高速。Cloudflare Workers などにもそのまま載せられる）
- PostgreSQL 17（`pg`）、メール送信（`nodemailer` → Mailpit）
- 品質チェック：Vitest（テスト）、ESLint（typescript-eslint）、Prettier（整形）

> TypeScript 7 はすでに公開されていますが、コード検査の typescript-eslint がまだ対応していないため、6系に固定しています（2026-10-09 時点）。

## 初回だけの準備

1. Docker Desktop を起動する（初めての PC は、先に管理者の PowerShell で `wsl --install` と再起動が必要）
2. このフォルダで準備コマンドを実行する
   ```powershell
   cd ts-dev-env
   .\dev.ps1 setup
   ```
   終わったら http://localhost:3000 を開いて、DB が「接続できました」になっていれば完了です。

> PowerShell で「スクリプトの実行が無効」と出たら：`powershell -ExecutionPolicy Bypass -File .\dev.ps1 setup`

## 普段の使い方

```powershell
.\dev.ps1 up              # 起動
.\dev.ps1 down            # 停止
.\dev.ps1 check           # 型チェック・ESLint・テストをまとめて実行
.\dev.ps1 pnpm add zod    # ライブラリを追加
.\dev.ps1 help            # コマンド一覧
```

## VS Code で開発する（おすすめ）

VS Code でこのフォルダを開き、「コンテナーで再度開く（Reopen in Container）」を選ぶと、コンテナの中で補完・ESLint・Prettier・テストがそのまま使えます（拡張機能「Dev Containers」が必要）。

## お客さまのソースを扱うときの注意

- お客さまのソースや個人情報を AI（Claude など）に渡す前に、秘密保持契約で外部の AI サービスの利用が認められているかを確認する
- `.env` には本番のパスワードや API キーを入れない（この環境はローカル専用の値で動く）
- 納品前に、自分で画面を動かして確認し、確認の手順と結果を添える

## フォルダ構成

```
ts-dev-env/
├─ compose.yaml        … どのサービスを起動するか
├─ env.example         … 設定の見本（setup で .env にコピーされる）
├─ dev.ps1             … 操作コマンド
├─ docker/node/        … Node.js のイメージ
├─ app/                … アプリのソース（ここを案件ごとに入れ替える）
│  ├─ src/app.ts       … 画面と API
│  ├─ src/server.ts    … 起動
│  ├─ src/*.test.ts    … テスト
│  └─ package.json
└─ .devcontainer/      … VS Code Dev Containers の設定
```
