import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import '@/i18n'; // 初始化 i18next（console 资源叠加在共享基线之上，副作用）
import { bootstrapBrand } from '@hashmatrix/brand';
import { AppProviders } from '@/app/AppProviders';
import { router } from '@/app/router';

// 应用挂载前把初始品牌分发到 document（CSS Vars / favicon / title）。
bootstrapBrand();

/**
 * 开发态启用 msw mock（动态 import，生产构建经 tree-shaking 不打包）。
 * 后端未就绪期间让全站（canonical 真页 + 元数据管理）在无后端环境下跑通 mock 供数。
 */
async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV) return;
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root not found');

void enableMocking().then(() => {
  createRoot(rootEl).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
});
