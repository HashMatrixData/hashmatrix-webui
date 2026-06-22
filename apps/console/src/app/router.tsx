/* eslint-disable react-refresh/only-export-components -- 路由表模块：导出 lazy 组件与 router 单例，非 HMR 组件文件 */
import { lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AppLayout } from '@/layout/AppLayout';
import { RequireAuth, RequireRole, ROLES } from '@hashmatrix/sdk';
import { DEFAULT_ROUTE } from '@/routes/navConfig';

// 按模块路由懒加载（spec §1 路由）。
const PlaygroundPage = lazy(() =>
  import('@/modules/playground/PlaygroundPage').then((m) => ({ default: m.PlaygroundPage })),
);
const LineagePage = lazy(() =>
  import('@/modules/lineage/LineagePage').then((m) => ({ default: m.LineagePage })),
);
const OrchestrationPage = lazy(() =>
  import('@/modules/orchestration/OrchestrationPage').then((m) => ({ default: m.OrchestrationPage })),
);
const DashboardPage = lazy(() =>
  import('@/modules/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const GovernancePage = lazy(() =>
  import('@/modules/governance/GovernancePage').then((m) => ({ default: m.GovernancePage })),
);
// 元数据管理 3 个平面分组（各内部用 Tab 承载原子页面，IA 合并阶段1）。
const ModelingPage = lazy(() =>
  import('@/modules/metadata/ModelingPage').then((m) => ({ default: m.ModelingPage })),
);
const AssetsPage = lazy(() =>
  import('@/modules/metadata/AssetsPage').then((m) => ({ default: m.AssetsPage })),
);
const OpsPage = lazy(() =>
  import('@/modules/metadata/OpsPage').then((m) => ({ default: m.OpsPage })),
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to={DEFAULT_ROUTE} replace /> },
      { path: 'playground', element: <PlaygroundPage /> },
      { path: 'lineage', element: <LineagePage /> },
      { path: 'orchestration', element: <OrchestrationPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      {
        path: 'metadata',
        element: (
          <RequireRole roles={[ROLES.GOVERNANCE_EDITOR, ROLES.ADMIN]}>
            <Outlet />
          </RequireRole>
        ),
        children: [
          { index: true, element: <Navigate to="/metadata/modeling" replace /> },
          { path: 'modeling', element: <ModelingPage /> },
          { path: 'assets', element: <AssetsPage /> },
          { path: 'ops', element: <OpsPage /> },
        ],
      },
      {
        path: 'governance',
        element: (
          <RequireRole roles={[ROLES.GOVERNANCE_EDITOR, ROLES.ADMIN]}>
            <GovernancePage />
          </RequireRole>
        ),
      },
      { path: '*', element: <Navigate to={DEFAULT_ROUTE} replace /> },
    ],
  },
]);
