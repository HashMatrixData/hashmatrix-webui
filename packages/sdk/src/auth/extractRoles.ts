import type { User } from 'oidc-client-ts';

interface KeycloakAccessClaims {
  realm_access?: { roles?: string[] };
  resource_access?: Record<string, { roles?: string[] }>;
  name?: string;
  preferred_username?: string;
  email?: string;
  /** 租户声明（Keycloak Organizations，org=租户；见 extractTenant）。claim 名待 IdP mapper 契约最终确认。 */
  tenant?: string;
  /** 多 org membership（D1）；通常缺省或单元素。 */
  tenants?: string[];
}

/** Base64URL JWT payload 解码（仅读 claims，不做签名校验——校验在网关/IdP 侧）。角色与租户提取共用。 */
export function decodeJwtPayload(token: string): KeycloakAccessClaims | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json) as KeycloakAccessClaims;
  } catch {
    return null;
  }
}

/**
 * 从 Keycloak User 提取角色：realm_access.roles + resource_access[clientId].roles。
 * 角色来自 access_token；id_token profile 通常不含角色。
 */
export function extractRoles(user: User | null | undefined, clientId: string): string[] {
  if (!user?.access_token) return [];
  const claims = decodeJwtPayload(user.access_token);
  if (!claims) return [];
  const realmRoles = claims.realm_access?.roles ?? [];
  const clientRoles = claims.resource_access?.[clientId]?.roles ?? [];
  return Array.from(new Set([...realmRoles, ...clientRoles]));
}

export function extractDisplayName(user: User | null | undefined): string {
  const profile = user?.profile;
  // profile.name 已是 string|undefined；preferred_username 为自定义 claim（unknown），仅此处显式收窄。
  const preferred = typeof profile?.preferred_username === 'string' ? profile.preferred_username : undefined;
  return profile?.name || preferred || 'User';
}
