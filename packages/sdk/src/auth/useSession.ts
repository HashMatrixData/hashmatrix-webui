import { useContext } from 'react';
import { SessionContext, type Session } from './session';

/** 读取当前会话。必须在 AppAuthProvider 子树内使用。 */
export function useSession(): Session {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession 必须在 <AppAuthProvider> 内使用');
  }
  return ctx;
}
