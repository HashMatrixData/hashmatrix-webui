import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 开发期浏览器内 mock（control-plane 尚无真实后端时，`pnpm dev` 也能看五屏数据）。
export const worker = setupWorker(...handlers);
