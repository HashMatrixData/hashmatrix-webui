/* eslint-disable react-refresh/only-export-components -- 路由表模块：导出 lazy 组件与 router 单例，非 HMR 组件文件 */
import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RequireAuth, RequireRole, ROLES } from '@hashmatrix/sdk';
import { AppLayout } from '@/layout/AppLayout';
import { DEFAULT_ROUTE } from '@/routes/navConfig';

// 按模块路由懒加载。
const TenantDirectoryPage = lazy(() =>
  import('@/modules/tenants/TenantDirectoryPage').then((m) => ({ default: m.TenantDirectoryPage })),
);
const ApprovalsPage = lazy(() =>
  import('@/modules/approvals/ApprovalsPage').then((m) => ({ default: m.ApprovalsPage })),
);
const ProvisioningPage = lazy(() =>
  import('@/modules/provisioning/ProvisioningPage').then((m) => ({ default: m.ProvisioningPage })),
);
const QuotasPage = lazy(() => import('@/modules/quotas/QuotasPage').then((m) => ({ default: m.QuotasPage })));
const LifecyclePage = lazy(() =>
  import('@/modules/lifecycle/LifecyclePage').then((m) => ({ default: m.LifecyclePage })),
);

// 整个管理平面要求跨租户 superadmin（路由级守卫，非授权用户呈现 403、不可达）。
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <RequireRole roles={[ROLES.SUPERADMIN]}>
          <AppLayout />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to={DEFAULT_ROUTE} replace /> },
      { path: 'tenants', element: <TenantDirectoryPage /> },
      { path: 'approvals', element: <ApprovalsPage /> },
      { path: 'provisioning', element: <ProvisioningPage /> },
      { path: 'quotas', element: <QuotasPage /> },
      { path: 'lifecycle', element: <LifecyclePage /> },
      { path: '*', element: <Navigate to={DEFAULT_ROUTE} replace /> },
    ],
  },
]);
