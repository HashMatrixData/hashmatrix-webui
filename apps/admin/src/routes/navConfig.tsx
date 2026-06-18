import type { ReactNode } from 'react';
import type { ParseKeys } from 'i18next';
import {
  ClusterOutlined,
  AuditOutlined,
  CloudServerOutlined,
  DashboardOutlined,
  RetweetOutlined,
} from '@ant-design/icons';

/** admin 导航单一来源（被 ProLayout 菜单与路由共同消费）。整个管理平面已由 SUPERADMIN 守卫。 */
export interface NavItem {
  path: string;
  labelKey: ParseKeys;
  icon: ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/tenants', labelKey: 'menu.tenants', icon: <ClusterOutlined /> },
  { path: '/approvals', labelKey: 'menu.approvals', icon: <AuditOutlined /> },
  { path: '/provisioning', labelKey: 'menu.provisioning', icon: <CloudServerOutlined /> },
  { path: '/quotas', labelKey: 'menu.quotas', icon: <DashboardOutlined /> },
  { path: '/lifecycle', labelKey: 'menu.lifecycle', icon: <RetweetOutlined /> },
];

export const DEFAULT_ROUTE = '/tenants';
