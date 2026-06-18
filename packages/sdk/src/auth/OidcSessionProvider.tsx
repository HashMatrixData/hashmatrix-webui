import { useEffect, useMemo, type ReactNode } from 'react';
import { useAuth } from 'react-oidc-context';
import { SessionContext, type Session } from './session';
import { extractRoles, extractDisplayName } from './extractRoles';
import { setAuthTokenProvider } from '../api';
import { getRuntimeConfig } from '@hashmatrix/brand';

/** 把 react-oidc-context 的鉴权态映射为统一 Session。 */
export function OidcSessionProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const clientId = getRuntimeConfig().oidc?.clientId ?? 'hashmatrix-webui';

  // 把 OIDC access_token 注入 axios 拦截器（请求附加 Bearer）。provider 读时取当前令牌，自动跟随刷新。
  useEffect(() => {
    setAuthTokenProvider(() => auth.user?.access_token);
  }, [auth]);

  const session = useMemo<Session>(() => {
    const roles = extractRoles(auth.user, clientId);
    return {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      user: auth.isAuthenticated
        ? {
            name: extractDisplayName(auth.user),
            email: auth.user?.profile?.email,
            roles,
          }
        : null,
      error: auth.error?.message,
      signIn: () => void auth.signinRedirect(),
      signOut: () => void auth.signoutRedirect(),
    };
  }, [auth, clientId]);

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
