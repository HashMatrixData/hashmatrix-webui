import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import '@/i18n'; // 初始化 i18next（admin 资源叠加在共享基线之上，副作用）
import { bootstrapBrand } from '@hashmatrix/brand';
import { configureMockSession, ROLES } from '@hashmatrix/sdk';
import { AppProviders } from '@/app/AppProviders';
import { router } from '@/app/router';

// 开发期 mock 会话身份：跨租户 superadmin（真实部署由 OIDC 提供角色）。
configureMockSession({ name: 'Ops Admin', email: 'ops.admin@example.com', roles: [ROLES.SUPERADMIN] });

// 应用挂载前把初始品牌分发到 document（CSS Vars / favicon / title）。
bootstrapBrand();

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root not found');

async function bootstrap() {
  // 开发期启动浏览器内 msw（control-plane 无真实后端时，`pnpm dev` 也能看五屏数据）。
  if (import.meta.env.DEV) {
    const { worker } = await import('@/mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
  createRoot(rootEl!).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
}

void bootstrap();
