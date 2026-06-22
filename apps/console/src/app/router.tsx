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
const MetamodelPage = lazy(() =>
  import('@/modules/metadata/metamodel/MetamodelPage').then((m) => ({ default: m.MetamodelPage })),
);
const RelationshipPage = lazy(() =>
  import('@/modules/metadata/relationship/RelationshipPage').then((m) => ({ default: m.RelationshipPage })),
);
const ClassificationPage = lazy(() =>
  import('@/modules/metadata/classification/ClassificationPage').then((m) => ({
    default: m.ClassificationPage,
  })),
);
const TemplatesPage = lazy(() =>
  import('@/modules/metadata/templates/TemplatesPage').then((m) => ({ default: m.TemplatesPage })),
);
const ValidationPage = lazy(() =>
  import('@/modules/metadata/validation/ValidationPage').then((m) => ({ default: m.ValidationPage })),
);
const InstancePage = lazy(() =>
  import('@/modules/metadata/instance/InstancePage').then((m) => ({ default: m.InstancePage })),
);
const LineageAnalysisPage = lazy(() =>
  import('@/modules/metadata/lineage/LineageAnalysisPage').then((m) => ({
    default: m.LineageAnalysisPage,
  })),
);
const CollectPage = lazy(() =>
  import('@/modules/metadata/collect/CollectPage').then((m) => ({ default: m.CollectPage })),
);
const EventsPage = lazy(() =>
  import('@/modules/metadata/events/EventsPage').then((m) => ({ default: m.EventsPage })),
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
          { index: true, element: <Navigate to="/metadata/metamodel" replace /> },
          { path: 'metamodel', element: <MetamodelPage /> },
          { path: 'relationship', element: <RelationshipPage /> },
          { path: 'classification', element: <ClassificationPage /> },
          { path: 'templates', element: <TemplatesPage /> },
          { path: 'validation', element: <ValidationPage /> },
          { path: 'instance', element: <InstancePage /> },
          { path: 'lineage', element: <LineageAnalysisPage /> },
          { path: 'collect', element: <CollectPage /> },
          { path: 'events', element: <EventsPage /> },
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
