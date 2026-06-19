/**
 * 组织成员 mock 数据（#14 · 租户自管理）。
 * 脱敏：通用 `Demo User N` / `example.com` 邮箱、虚构角色与组名，无任何真实甲方成员。
 */
export interface OrgMember {
  id: string;
  name: string;
  email: string;
  /** 直接授予的角色键（与 Keycloak realm 角色映射；演示占位）。 */
  roles: string[];
  /** 归属用户组（演示占位）。 */
  groups: string[];
  status: 'active' | 'invited' | 'disabled';
  joinedAt: string;
}

const STATUSES = ['active', 'invited', 'disabled'] as const;
const ROLE_POOL = ['tenant-admin', 'data-engineer', 'analyst', 'viewer'];
const GROUP_POOL = ['platform-ops', 'data-dev', 'analysts'];

/** 确定性生成（无随机，story / E2E 可断言）。 */
export const ORG_MEMBERS: OrgMember[] = Array.from({ length: 23 }, (_, i) => ({
  id: `usr_${String(i + 1).padStart(3, '0')}`,
  name: `Demo User ${i + 1}`,
  email: `demo.user${i + 1}@example.com`,
  roles: [ROLE_POOL[i % ROLE_POOL.length]],
  groups: [GROUP_POOL[i % GROUP_POOL.length]],
  status: STATUSES[i % STATUSES.length],
  joinedAt: `2026-0${(i % 9) + 1}-15`,
}));
