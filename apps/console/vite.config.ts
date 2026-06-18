/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 信创约束：兼容国产浏览器/旧 Chromium 内核。
// 通过 build.target 降级 ES 输出（不依赖公网 CDN，资源自托管）。
// 如需更老内核，可叠加 @vitejs/plugin-legacy（见 docs/00-前端初始化-spec.md §7 暂缓项）。
const LEGACY_BUILD_TARGET = ['es2015', 'chrome80', 'edge88', 'firefox78', 'safari14'];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: LEGACY_BUILD_TARGET,
    cssTarget: 'chrome80',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
});
