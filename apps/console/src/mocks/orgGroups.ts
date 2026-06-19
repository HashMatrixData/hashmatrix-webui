/**
 * 组织用户组 mock 数据（#14 · 租户自管理）。
 * 脱敏：通用组名 / 描述、虚构成员数，无任何真实甲方组织结构。
 */
export interface OrgGroup {
  id: string;
  name: string;
  memberCount: number;
  /** 组绑定的角色（成员经组继承；演示占位）。 */
  roles: string[];
  description: string;
}

export const ORG_GROUPS: OrgGroup[] = [
  { id: 'grp_ops', name: 'platform-ops', memberCount: 4, roles: ['tenant-admin'], description: 'Platform operations and tenant administration.' },
  { id: 'grp_dev', name: 'data-dev', memberCount: 9, roles: ['data-engineer'], description: 'Data integration and development engineers.' },
  { id: 'grp_analyst', name: 'analysts', memberCount: 8, roles: ['analyst', 'viewer'], description: 'Business analysts with query access.' },
  { id: 'grp_sec', name: 'security', memberCount: 2, roles: ['security-officer'], description: 'Data security and compliance team.' },
];
