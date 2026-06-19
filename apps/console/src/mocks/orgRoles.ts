/**
 * 组织角色 mock 数据（#14 · 租户自管理）。
 * 脱敏：通用角色键 / 显示名 / 描述，是「与 Keycloak 角色映射」的演示占位，无任何真实甲方角色语义。
 */
export interface OrgRole {
  id: string;
  /** 角色键（Keycloak realm / client 角色名；演示占位）。 */
  name: string;
  displayName: string;
  memberCount: number;
  /** 内置角色（不可删除）vs 自定义角色。 */
  builtin: boolean;
  description: string;
}

export const ORG_ROLES: OrgRole[] = [
  { id: 'role_admin', name: 'tenant-admin', displayName: 'Tenant Admin', memberCount: 2, builtin: true, description: 'Full tenant access: members, roles, groups and all modules.' },
  { id: 'role_eng', name: 'data-engineer', displayName: 'Data Engineer', memberCount: 6, builtin: true, description: 'Read/write on integration, development and architecture.' },
  { id: 'role_analyst', name: 'analyst', displayName: 'Analyst', memberCount: 8, builtin: true, description: 'Query access to catalog, quality and data service.' },
  { id: 'role_viewer', name: 'viewer', displayName: 'Viewer', memberCount: 5, builtin: true, description: 'Read-only across modules.' },
  { id: 'role_sec', name: 'security-officer', displayName: 'Security Officer', memberCount: 1, builtin: false, description: 'Manage classification, grading and masking policies.' },
  { id: 'role_priv', name: 'privacy-operator', displayName: 'Privacy Operator', memberCount: 1, builtin: false, description: 'Launch and monitor privacy-computing tasks.' },
];
