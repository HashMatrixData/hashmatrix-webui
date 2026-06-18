import { createContext } from 'react';

export interface SessionUser {
  name: string;
  email?: string;
  roles: string[];
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
