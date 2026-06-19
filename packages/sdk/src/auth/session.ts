import { createContext } from 'react';

export interface SessionUser {
  name: string;
  email?: string;
  roles: string[];
  /** 当前租户（org=租户；OIDC token `tenant` 声明 / mock seed 派生）。跨租户(admin)/未登录为 null。 */
  tenant: string | null;
  /** 可访问的全部租户（D1 多 org membership）；M1 通常单元素或缺省。 */
  tenants?: string[];
}

/** 统一会话契约——上层不感知底层是真实 OIDC 还是脚手架 mock。 */
export interface Session {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: SessionUser | null;
  error?: string;
  signIn: () => void;
  signOut: () => void;
}

export const SessionContext = createContext<Session | null>(null);
