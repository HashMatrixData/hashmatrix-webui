import type { ReactNode } from 'react';
import { usePermission } from './usePermission';

interface PermissionGuardProps {
  /** 需要的角色（OR 语义）。缺省/空 → 任何登录用户可见。 */
  roles?: readonly string[];
  children: ReactNode;
  /** 无权限时的回退（默认不渲染）。 */
  fallback?: ReactNode;
}

/** 按钮级/区块级权限门控：无权限默认隐藏（可传 fallback 显示禁用态）。 */
export function PermissionGuard({ roles = [], children, fallback = null }: PermissionGuardProps) {
  const { can } = usePermission();
  return <>{can(roles) ? children : fallback}</>;
}
