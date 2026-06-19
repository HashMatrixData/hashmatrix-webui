import { useEffect, useMemo, type ReactNode } from 'react';
import { SessionContext, type Session } from './session';
import { useMockSessionStore } from './mockSessionStore';
import { setTenantProvider } from '../api';

/** 用 mock store 提供统一 Session（脚手架默认 / 测试夹具）。 */
export function MockSessionProvider({ children }: { children: ReactNode }) {
  const signedIn = useMockSessionStore((s) => s.signedIn);
  const name = useMockSessionStore((s) => s.name);
  const email = useMockSessionStore((s) => s.email);
  const roles = useMockSessionStore((s) => s.roles);
  const tenant = useMockSessionStore((s) => s.tenant);
  const signIn = useMockSessionStore((s) => s.signIn);
  const signOut = useMockSessionStore((s) => s.signOut);

  // 把 mock 租户注入 axios 拦截器（请求附加 X-Tenant-Id）。读时取当前 store 值，跟随 setTenant 切换；
  // tenant 为 null（admin 跨租户）时返回 undefined → 不附该头。
  useEffect(() => {
    setTenantProvider(() => useMockSessionStore.getState().tenant ?? undefined);
  }, []);

  const session = useMemo<Session>(
    () => ({
      isAuthenticated: signedIn,
      isLoading: false,
      user: signedIn ? { name, email, roles, tenant } : null,
      signIn,
      signOut,
    }),
    [signedIn, name, email, roles, tenant, signIn, signOut],
  );

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
