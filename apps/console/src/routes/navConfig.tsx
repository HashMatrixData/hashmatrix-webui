import type { ReactNode } from 'react';
import type { ParseKeys } from 'i18next';
import {
  HomeOutlined,
  ControlOutlined,
  SwapOutlined,
  BuildOutlined,
  DatabaseOutlined,
  CodeOutlined,
  CheckCircleOutlined,
  FolderOpenOutlined,
  SafetyOutlined,
  ApiOutlined,
  LockOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { ROLES } from '@hashmatrix/sdk';

/**
 * 导航/路由单一来源：被 ProLayout 菜单（{@link NAV_ITEMS}）与 React Router 路由
 * （{@link NAV_LEAVES}）共同消费——菜单与路由由同一棵树派生，结构上保证「零断链」。
 *
 * 本树为 WP2「使能刀」铺设的 canonical 一级模块（L1）骨架：
 * - taxonomy 是跨仓共享物（prototype + console + PRD）= 契约级、主仓 owns，子仓不自创。
 *   canonical 源 = 主仓 prototype submodule `prototype/components/sidebar.tsx`（已逐项核对）。
 * - **L1 共 11**（含独立的「组织管理」，非折叠进管理中心）；M1 仅落 **L1/L2**，
 *   canonical 更深的 L3/L4 显式后置（由各页面刀 #11/#12/#13 增量接入）。
 * - 每个 L2 在 M1 即为可达叶子，渲染共享 `<ModulePlaceholder>` 标题占位页。
 *   路径取舍：canonical 已给 href 的叶子按原样使用；canonical 下挂 L3 的分组节点
 *   （M1 暂作叶子）使用「模块前缀 + 节点 slug」的**占位路径**，待其 L3 落地时该节点
 *   转为父级、占位路径自然退役（不影响骨架，故不构成返工）。
 */
export interface NavItem {
  path: string;
  /** i18n key（受静态校验）。 */
  labelKey: ParseKeys;
  /** L1 模块携带图标；L2 叶子省略。 */
  icon?: ReactNode;
  /** 路由级/菜单级所需角色（OR 语义）。缺省 → 任何登录用户可见。
   *  门控由 {@link filterNavByRole}（菜单级隐藏）与 router 的 `RequireRole`（路由级兜底）共同消费。
   *  当前仅「组织管理」按 admin 门控（#14）；其余模块 M1 暂全员可见。 */
  roles?: readonly string[];
  /** L2 子项（M1 菜单深度 ≤ 2）。 */
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  // 1. 概览（L1 叶子 → 落地首页）
  { path: '/', labelKey: 'menu.overview', icon: <HomeOutlined /> },

  // 2. 管理中心（基础配置的标签/逻辑类型映射/告警 = L3 后置）
  {
    path: '/management-center',
    labelKey: 'menu.managementCenter',
    icon: <ControlOutlined />,
    children: [
      { path: '/datasource', labelKey: 'menu.datasource' },
      { path: '/settings/basic-config', labelKey: 'menu.basicConfig' },
    ],
  },

  // 3. 数据集成（离线/实时各自的 L3 子项后置）
  {
    path: '/data-integration',
    labelKey: 'menu.dataIntegration',
    icon: <SwapOutlined />,
    children: [
      { path: '/integration/batch', labelKey: 'menu.batchIntegration' },
      { path: '/integration/realtime', labelKey: 'menu.realtimeIntegration' },
    ],
  },

  // 4. 数据架构（模型设计>维度建模>… 等 L3/L4 后置）
  {
    path: '/data-architecture',
    labelKey: 'menu.dataArchitecture',
    icon: <BuildOutlined />,
    children: [
      // 数仓设计「页面刀」：L2 由占位叶子升为父级，落 canonical L3（集市已确认不做；
      // 数仓分层↔分层管理去重合并为「数仓分层」单页；主题设计仅作分组、数据域/业务过程直接平铺）。
      {
        path: '/standard/warehouse-design',
        labelKey: 'menu.warehouseDesign',
        children: [
          { path: '/standard/warehouse-design/layer', labelKey: 'menu.dwLayer' },
          { path: '/standard/warehouse-design/domain', labelKey: 'menu.dataDomain' },
          { path: '/standard/warehouse-design/process', labelKey: 'menu.bizProcess' },
          { path: '/standard/warehouse-design/category', labelKey: 'menu.bizCategory' },
        ],
      },
      { path: '/standard/data-standard', labelKey: 'menu.dataStandard' },
      { path: '/standard/model-design', labelKey: 'menu.modelDesign' },
      { path: '/standard/model-design/dws-designer', labelKey: 'menu.dwsDesigner' },
      { path: '/standard/model-design/ads-designer', labelKey: 'menu.adsDesigner' },
      { path: '/standard/indicators', labelKey: 'menu.dataIndicator' },
    ],
  },

  // 4b. 元数据管理（方案3 混合：独立 L1 · 元模型引擎之家。与数据架构平级——数据架构建标/建模
  //    依赖本模块的 typedef+instance 引擎；未来抽为独立服务。子页由元数据会话增量接入，路径沿用现有
  //    `/asset/metadata/*`·`/catalog/analysis` 真页接线（故不改 router）。其余子页（关系/分类/校验/
  //    模板/实例/事件/元模型台账）由该会话陆续挂到本 L1。）
  {
    path: '/metadata',
    labelKey: 'menu.metadata',
    icon: <DatabaseOutlined />,
    roles: [ROLES.GOVERNANCE_EDITOR, ROLES.ADMIN],
    children: [
      { path: '/asset/metadata/meta-model', labelKey: 'menu.metaModel' },
      { path: '/asset/metadata/crawler', labelKey: 'menu.metadataCrawler' },
      { path: '/catalog/analysis', labelKey: 'menu.catalogLineage' },
    ],
  },

  // 5. 数据开发
  {
    path: '/data-development',
    labelKey: 'menu.dataDevelopment',
    icon: <CodeOutlined />,
    children: [
      { path: '/development/data-dev', labelKey: 'menu.devWorkbench' },
      { path: '/development/periodic-schedule', labelKey: 'menu.periodicTask' },
      { path: '/development/query', labelKey: 'menu.tempQuery' },
      { path: '/development/ops/overview', labelKey: 'menu.opsMonitor' },
    ],
  },

  // 6. 数据质量
  {
    path: '/data-quality',
    labelKey: 'menu.dataQuality',
    icon: <CheckCircleOutlined />,
    children: [
      { path: '/asset/quality/monitor-dashboard', labelKey: 'menu.qualityDashboard' },
      { path: '/asset/quality/rule-manager', labelKey: 'menu.qualityRules' },
    ],
  },

  // 7. 数据目录（方案3：瘦身为「数据地图/检索」纯目录；元模型/采集/血缘已上移至「元数据管理」L1）。
  {
    path: '/data-catalog',
    labelKey: 'menu.dataCatalog',
    icon: <FolderOpenOutlined />,
    children: [{ path: '/catalog/map', labelKey: 'menu.catalogMap' }],
  },

  // 8. 数据安全（分类分级/脱敏/水印/统一权限各自的 L3 后置）
  {
    path: '/data-security',
    labelKey: 'menu.dataSecurity',
    icon: <SafetyOutlined />,
    children: [
      { path: '/asset/security/classification', labelKey: 'menu.classification' },
      { path: '/asset/security/masking', labelKey: 'menu.dataMasking' },
      { path: '/asset/security/watermark', labelKey: 'menu.dataWatermark' },
      // 注：此占位路径恰等于 canonical 该节点首个 L3「数据权限/overview」的 href——
      // L3 落地时应把本 path 升级为该 overview 子路由（而非新建平行路径），实现无缝退役。
      { path: '/asset/security/permission', labelKey: 'menu.dataPermission' },
      { path: '/asset/security/policy-manager', labelKey: 'menu.securityPolicy' },
    ],
  },

  // 9. 数据服务
  {
    path: '/data-service',
    labelKey: 'menu.dataService',
    icon: <ApiOutlined />,
    children: [{ path: '/api-service/developer', labelKey: 'menu.apiDeveloper' }],
  },

  // 10. 隐私计算（我方特色）
  {
    path: '/privacy-computing',
    labelKey: 'menu.privacyComputing',
    icon: <LockOutlined />,
    children: [
      { path: '/privacy/overview', labelKey: 'menu.privacyOverview' },
      { path: '/privacy/psi', labelKey: 'menu.privacyPsi' },
      { path: '/privacy/anonymous-query', labelKey: 'menu.privacyAnonymous' },
      { path: '/privacy/nodes', labelKey: 'menu.privacyNodes' },
    ],
  },

  // 11. 组织管理（独立 L1 · 租户自治 · 使用平面租户自管理「≠ admin」）。
  //     #14 起按 admin 角色门控：L1 + 全部叶子带 roles ⇒ 菜单级隐藏（filterNavByRole）+ 路由级守卫（RequireRole）。
  {
    path: '/org-admin',
    labelKey: 'menu.orgAdmin',
    icon: <TeamOutlined />,
    roles: [ROLES.ADMIN],
    children: [
      { path: '/settings/users', labelKey: 'menu.orgMembers', roles: [ROLES.ADMIN] },
      { path: '/settings/roles', labelKey: 'menu.orgRoles', roles: [ROLES.ADMIN] },
      { path: '/settings/user-groups', labelKey: 'menu.orgGroups', roles: [ROLES.ADMIN] },
    ],
  },
];

/** 路由消费的扁平叶子描述（由 {@link NAV_ITEMS} 派生，保证菜单↔路由一一对应）。 */
export interface NavLeaf {
  path: string;
  labelKey: ParseKeys;
  roles?: readonly string[];
}

function collectLeaves(items: NavItem[], acc: NavLeaf[] = []): NavLeaf[] {
  for (const item of items) {
    if (item.children && item.children.length > 0) {
      collectLeaves(item.children, acc);
    } else {
      acc.push({ path: item.path, labelKey: item.labelKey, roles: item.roles });
    }
  }
  return acc;
}

export const NAV_LEAVES: NavLeaf[] = collectLeaves(NAV_ITEMS);

/**
 * 按角色递归过滤导航树（菜单级权限）：滤掉无权限项；子项被滤空的父级一并隐藏。
 * `can(required)` 为 OR 语义（空 required = 公开），与按钮级 `usePermission` 同源——由
 * {@link AppLayout} 注入。提取为纯函数以便单测「无角色 ⇒ 组织管理整组消失」（#14）。
 */
export function filterNavByRole(
  items: NavItem[],
  can: (roles: readonly string[]) => boolean,
): NavItem[] {
  return items
    .filter((item) => can(item.roles ?? []))
    .map((item) => (item.children ? { ...item, children: filterNavByRole(item.children, can) } : item))
    .filter((item) => !item.children || item.children.length > 0);
}

/** 落地/兜底路由：概览。 */
export const DEFAULT_ROUTE = '/';
