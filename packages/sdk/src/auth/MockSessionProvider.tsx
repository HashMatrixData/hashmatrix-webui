import { useMemo, type ReactNode } from 'react';
import { SessionContext, type Session } from './session';
import { useMockSessionStore } from './mockSessionStore';

/** 用 mock store 提供统一 Session（脚手架默认 / 测试夹具）。 */
export function MockSessionProvider({ children }: { children: ReactNode }) {
  const signedIn = useMockSessionStore((s) => s.signedIn);
  const name = useMockSessionStore((s) => s.name);
  const email = useMockSessionStore((s) => s.email);
  const roles = useMockSessionStore((s) => s.roles);
  const signIn = useMockSessionStore((s) => s.signIn);
  const signOut = useMockSessionStore((s) => s.signOut);

  const session = useMemo<Session>(
    () => ({
      isAuthenticated: signedIn,
      isLoading: false,
      user: signedIn ? { name, email, roles } : null,
      signIn,
      signOut,
    }),
    [signedIn, name, email, roles, signIn, signOut],
  );

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
