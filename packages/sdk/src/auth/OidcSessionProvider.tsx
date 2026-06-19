import { useEffect, useMemo, type ReactNode } from 'react';
import { useAuth } from 'react-oidc-context';
import { SessionContext, type Session } from './session';
import { extractRoles, extractDisplayName } from './extractRoles';
import { extractTenant } from './extractTenant';
import { setAuthTokenProvider, setTenantProvider } from '../api';
import { getRuntimeConfig } from '@hashmatrix/brand';

/** 把 react-oidc-context 的鉴权态映射为统一 Session。 */
export function OidcSessionProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const clientId = getRuntimeConfig().oidc?.clientId ?? 'hashmatrix-webui';

  // 把 OIDC access_token / 租户注入 axios 拦截器（请求附加 Bearer + X-Tenant-Id）。provider 读时取当前
  // 令牌，自动跟随刷新；切换租户=重换 token，X-Tenant-Id 随会话更新（D2）。
  useEffect(() => {
    setAuthTokenProvider(() => auth.user?.access_token);
    setTenantProvider(() => extractTenant(auth.user).tenant ?? undefined);
  }, [auth]);

  const session = useMemo<Session>(() => {
    const roles = extractRoles(auth.user, clientId);
    const { tenant, tenants } = extractTenant(auth.user);
    return {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      user: auth.isAuthenticated
        ? {
            name: extractDisplayName(auth.user),
            email: auth.user?.profile?.email,
            roles,
            tenant,
            tenants,
          }
        : null,
      error: auth.error?.message,
      signIn: () => void auth.signinRedirect(),
      signOut: () => void auth.signoutRedirect(),
    };
  }, [auth, clientId]);

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
