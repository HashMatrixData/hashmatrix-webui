/* eslint-disable react-refresh/only-export-components -- 路由表模块：导出 lazy 组件与 router 单例，非 HMR 组件文件 */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/layout/AppLayout';
import { ModulePlaceholder } from '@/components/ModulePlaceholder';
import { RequireAuth, RequireRole, ROLES } from '@hashmatrix/sdk';
import { DEFAULT_ROUTE, NAV_ITEMS, NAV_LEAVES, type NavItem, type NavLeaf } from '@/routes/navConfig';

// WP0 能力演示页（保留 · 不在 canonical 导航树，仅按 URL / Storybook 可达，待各页面刀
// #11/#12/#13 接入真实页时由对应 canonical 叶子承接）。
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

const demoRoutes: RouteObject[] = [
  { path: 'playground', element: <PlaygroundPage /> },
  { path: 'lineage', element: <LineagePage /> },
  { path: 'orchestration', element: <OrchestrationPage /> },
  { path: 'dashboard', element: <DashboardPage /> },
  {
    path: 'governance',
    element: (
      <RequireRole roles={[ROLES.GOVERNANCE_EDITOR, ROLES.ADMIN]}>
        <GovernancePage />
      </RequireRole>
    ),
  },
];

// canonical 叶子路由（由 navConfig 派生）：每叶子接共享 <ModulePlaceholder>，菜单↔路由一一对应。
// 概览（path '/'）作为 index 路由单列；其余叶子转为相对路径挂在 AppLayout 下。
function leafToRoute(leaf: NavLeaf): RouteObject {
  const element = <ModulePlaceholder titleKey={leaf.labelKey} />;
  return {
    path: leaf.path.replace(/^\//, ''),
    element: leaf.roles?.length ? <RequireRole roles={leaf.roles}>{element}</RequireRole> : element,
  };
}

const canonicalRoutes: RouteObject[] = NAV_LEAVES.filter((leaf) => leaf.path !== '/').map(leafToRoute);

// L1 父节点本身无独立页面：直接访问其 URL 时重定向到该模块首个叶子（而非兜底回概览）。
function firstLeafPath(item: NavItem): string {
  let node = item;
  while (node.children && node.children.length > 0) node = node.children[0];
  return node.path;
}

const parentRedirects: RouteObject[] = NAV_ITEMS.filter(
  (item) => item.children && item.children.length > 0,
).map((item) => ({
  path: item.path.replace(/^\//, ''),
  element: <Navigate to={firstLeafPath(item)} replace />,
}));

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <ModulePlaceholder titleKey="menu.overview" /> },
      ...canonicalRoutes,
      ...parentRedirects,
      ...demoRoutes,
      { path: '*', element: <Navigate to={DEFAULT_ROUTE} replace /> },
    ],
  },
]);
