import type { User } from 'oidc-client-ts';
import { decodeJwtPayload } from './extractRoles';

export interface TenantContext {
  /** 当前租户（org=租户；JWT `tenant` 声明派生）。无则 null（如 admin 跨租户 / 未登录）。 */
  tenant: string | null;
  /** 该用户可访问的全部租户（D1 多 org membership）；M1 通常单元素或缺省。 */
  tenants?: string[];
}

/**
 * 从 Keycloak access_token 提取租户上下文。
 * 平台身份模型：Keycloak Organizations 单 realm，org=租户，JWT 带 `tenant` 声明（architecture 05）。
 * 角色同源于 access_token（见 extractRoles），故此处亦读 access_token。
 * tolerant reader：缺 `tenant` 时回落 `tenants[0]`；都缺则 null（→ 拦截器不派生 X-Tenant-Id）。
 */
export function extractTenant(user: User | null | undefined): TenantContext {
  if (!user?.access_token) return { tenant: null };
  const claims = decodeJwtPayload(user.access_token);
  if (!claims) return { tenant: null };
  const tenants = Array.isArray(claims.tenants)
    ? claims.tenants.filter((t): t is string => typeof t === 'string')
    : undefined;
  const tenant = typeof claims.tenant === 'string' ? claims.tenant : (tenants?.[0] ?? null);
  return tenants?.length ? { tenant, tenants } : { tenant };
}
