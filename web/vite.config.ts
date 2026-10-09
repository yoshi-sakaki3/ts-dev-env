import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// 開発サーバー（http://localhost:5173）とテストの設定
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Windows のフォルダを監視するときに必要（保存したら画面がすぐ変わる）
    watch: { usePolling: true },
    // 画面からの /api/... を API サーバーに転送する（Docker では app コンテナ）
    proxy: { '/api': process.env.API_TARGET ?? 'http://localhost:3000' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
});
