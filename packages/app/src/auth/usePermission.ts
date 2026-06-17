import { useCallback, useMemo } from 'react';
import { useSession } from './useSession';
import { hasAnyRole } from './roles';

/** 按钮级/区块级权限判定。`can(required)` 为 OR 语义，空数组视为公开。 */
export function usePermission() {
  const { user } = useSession();
  // user.roles 引用稳定（来自会话 memo）；再 fallback 到稳定空数组，避免每次渲染换引用。
  const roles = useMemo(() => user?.roles ?? [], [user]);
  const can = useCallback((required: readonly string[] = []) => hasAnyRole(roles, required), [roles]);
  return { roles, can };
}
