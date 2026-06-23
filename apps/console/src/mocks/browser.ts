import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * 浏览器端 msw worker —— 仅开发态启用（见 main.tsx，动态 import 不进生产包）。
 * 让 `vite dev` 全站在无后端环境下也能跑通 mock 供数（含 canonical 真页与元数据管理）。
 */
export const worker = setupWorker(...handlers);
