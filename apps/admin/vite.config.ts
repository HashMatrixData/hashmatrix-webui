/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 信创：兼容国产浏览器/旧 Chromium 内核（build.target 降级，资源自托管）。与 console 一致。
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
  // admin 独立端口，避免与 console 本地开发冲突。
  server: { port: 5174, host: true },
  preview: { port: 4174, host: true },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
});
