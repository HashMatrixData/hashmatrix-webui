/**
 * 权限骨架（与 Keycloak 角色映射）。v1 做路由级 + 按钮级；
 * 字段级/行级权限为后续专项（见 spec §7 暂缓）。
 *
 * 角色命名为通用脱敏占位，禁止任何真实甲方角色/组织语义。
 */
export const ROLES = {
  ADMIN: 'admin',
  GOVERNANCE_EDITOR: 'governance:editor',
  VIEWER: 'viewer',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** 任意命中（OR 语义）。空 required 视为公开（任何登录用户可见）。 */
export function hasAnyRole(userRoles: readonly string[], required: readonly string[] = []): boolean {
  if (required.length === 0) return true;
  return required.some((r) => userRoles.includes(r));
}
