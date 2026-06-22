import type { ReactNode } from 'react';
import type { ParseKeys } from 'i18next';
import {
  ExperimentOutlined,
  DeploymentUnitOutlined,
  PartitionOutlined,
  FundOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  ApartmentOutlined,
  NodeIndexOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { ROLES } from '@hashmatrix/sdk';

/** 导航/路由单一来源：被 ProLayout 菜单与 React Router 路由共同消费。 */
export interface NavItem {
  path: string;
  /** i18n key（受静态校验）。 */
  labelKey: ParseKeys;
  icon: ReactNode;
  /** 路由级/菜单级所需角色（OR）。缺省 → 任何登录用户。 */
  roles?: readonly string[];
  /** 子菜单（一层）：父项为容器，子项落实际页面。 */
  children?: readonly NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/playground', labelKey: 'menu.playground', icon: <ExperimentOutlined /> },
  { path: '/lineage', labelKey: 'menu.lineage', icon: <DeploymentUnitOutlined /> },
  { path: '/orchestration', labelKey: 'menu.orchestration', icon: <PartitionOutlined /> },
  { path: '/dashboard', labelKey: 'menu.dashboard', icon: <FundOutlined /> },
  {
    path: '/metadata',
    labelKey: 'menu.metadata',
    icon: <DatabaseOutlined />,
    roles: [ROLES.GOVERNANCE_EDITOR, ROLES.ADMIN],
    children: [
      { path: '/metadata/metamodel', labelKey: 'menu.metamodel', icon: <ApartmentOutlined /> },
      { path: '/metadata/relationship', labelKey: 'menu.relationship', icon: <NodeIndexOutlined /> },
      { path: '/metadata/classification', labelKey: 'menu.classification', icon: <TagsOutlined /> },
    ],
  },
  {
    path: '/governance',
    labelKey: 'menu.governance',
    icon: <SafetyOutlined />,
    roles: [ROLES.GOVERNANCE_EDITOR, ROLES.ADMIN],
  },
];

export const DEFAULT_ROUTE = '/playground';
