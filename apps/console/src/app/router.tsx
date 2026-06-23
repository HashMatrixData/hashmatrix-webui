/* eslint-disable react-refresh/only-export-components -- 路由表模块：导出 lazy 组件与 router 单例，非 HMR 组件文件 */
import { lazy, type ReactNode } from 'react';
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
const GovernancePage = lazy(() =>
  import('@/modules/governance/GovernancePage').then((m) => ({ default: m.GovernancePage })),
);

// #11 WP3 · 数据生产链：三模块入口页（真页）。各挂在所属 L1 模块的首叶（= parentRedirects 的落点），
// 由 REAL_PAGE_BY_PATH 覆盖该叶子的默认占位；同模块其余叶子仍渲染 <ModulePlaceholder>，菜单零断链。
const IntegrationPage = lazy(() =>
  import('@/modules/integration/IntegrationPage').then((m) => ({ default: m.IntegrationPage })),
);
const ArchitecturePage = lazy(() =>
  import('@/modules/architecture/ArchitecturePage').then((m) => ({ default: m.ArchitecturePage })),
);
const DevelopmentPage = lazy(() =>
  import('@/modules/development/DevelopmentPage').then((m) => ({ default: m.DevelopmentPage })),
);

// #12 WP3 · 资产与质量：概览（index 路由单列）/ 数据目录 / 数据质量。
const OverviewPage = lazy(() =>
  import('@/modules/overview/OverviewPage').then((m) => ({ default: m.OverviewPage })),
);
const CatalogPage = lazy(() =>
  import('@/modules/catalog/CatalogPage').then((m) => ({ default: m.CatalogPage })),
);
const QualityPage = lazy(() =>
  import('@/modules/quality/QualityPage').then((m) => ({ default: m.QualityPage })),
);

// #13 WP3 · 治理与服务：数据安全（原生自研）/ 数据服务（原生自研）/ 隐私计算（品牌化外框占位）。
// 各挂在所属 L1 模块首叶；同模块其余叶子仍渲染 <ModulePlaceholder>，菜单零断链。
const SecurityPage = lazy(() =>
  import('@/modules/security/SecurityPage').then((m) => ({ default: m.SecurityPage })),
);
const ServicePage = lazy(() =>
  import('@/modules/service/ServicePage').then((m) => ({ default: m.ServicePage })),
);
const PrivacyPage = lazy(() =>
  import('@/modules/privacy/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
);

// #14 WP4a · 组织管理（独立 L1 · 租户自管理）：成员 / 角色 / 用户组三叶。叶子在 navConfig 带
// roles ⇒ leafToRoute 自动以 RequireRole 包裹（路由级守卫兜底）；菜单级隐藏见 filterNavByRole。
const MembersPage = lazy(() =>
  import('@/modules/org/members/MembersPage').then((m) => ({ default: m.MembersPage })),
);
const RolesPage = lazy(() =>
  import('@/modules/org/roles/RolesPage').then((m) => ({ default: m.RolesPage })),
);
const GroupsPage = lazy(() =>
  import('@/modules/org/groups/GroupsPage').then((m) => ({ default: m.GroupsPage })),
);

// 元数据管理（governance 元模型引擎 · mock-first）：设计器 / 采集 / 血缘 接 canonical 叶子。
const MetamodelDesignerPage = lazy(() =>
  import('@/modules/metadata/designer/MetamodelDesignerPage').then((m) => ({
    default: m.MetamodelDesignerPage,
  })),
);
const CollectPage = lazy(() =>
  import('@/modules/metadata/collect/CollectPage').then((m) => ({ default: m.CollectPage })),
);
const LineageAnalysisPage = lazy(() =>
  import('@/modules/metadata/lineage/LineageAnalysisPage').then((m) => ({
    default: m.LineageAnalysisPage,
  })),
);

// 数据架构「页面刀」· 数仓设计：数仓分层（OneData 五层治理）落 L3 首叶。`/standard/warehouse-design`
// 经 navConfig 升为父级 → parentRedirects 自动重定向至本叶；原 `warehouse-design` map 项变死项无害。
const WarehouseLayerPage = lazy(() =>
  import('@/modules/data-architecture/warehouse/WarehouseLayerPage').then((m) => ({
    default: m.WarehouseLayerPage,
  })),
);

/** canonical 叶子路径 → 真页（覆盖默认 ModulePlaceholder）。后续页面刀按此 map 增量接入。 */
const REAL_PAGE_BY_PATH: Record<string, ReactNode> = {
  // #11 数据生产链
  '/integration/batch': <IntegrationPage />,
  '/standard/warehouse-design': <ArchitecturePage />,
  '/development/data-dev': <DevelopmentPage />,
  // #12 资产与质量（概览见下方 index 路由）
  '/catalog/map': <CatalogPage />,
  '/asset/quality/monitor-dashboard': <QualityPage />,
  // #13 治理与服务
  '/asset/security/classification': <SecurityPage />,
  '/api-service/developer': <ServicePage />,
  '/privacy/overview': <PrivacyPage />,
  // #14 组织管理（admin 门控：路由级守卫由 leafToRoute 依叶子 roles 自动施加）
  '/settings/users': <MembersPage />,
  '/settings/roles': <RolesPage />,
  '/settings/user-groups': <GroupsPage />,
  // 数据架构 · 数仓设计：数仓分层（OneData 五层）。
  '/standard/warehouse-design/layer': <WarehouseLayerPage />,
  // 元数据管理：元模型设计器（画布工作台）/ 采集中心 / 血缘与影响分析。
  '/asset/metadata/meta-model': <MetamodelDesignerPage />,
  '/asset/metadata/crawler': <CollectPage />,
  '/catalog/analysis': <LineageAnalysisPage />,
};

const demoRoutes: RouteObject[] = [
  { path: 'playground', element: <PlaygroundPage /> },
  { path: 'lineage', element: <LineagePage /> },
  { path: 'orchestration', element: <OrchestrationPage /> },
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
  const element = REAL_PAGE_BY_PATH[leaf.path] ?? <ModulePlaceholder titleKey={leaf.labelKey} />;
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
      { index: true, element: <OverviewPage /> },
      ...canonicalRoutes,
      ...parentRedirects,
      ...demoRoutes,
      { path: '*', element: <Navigate to={DEFAULT_ROUTE} replace /> },
    ],
  },
]);
