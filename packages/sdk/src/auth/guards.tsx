import type { ReactNode } from 'react';
import { Button, Result, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSession } from './useSession';
import { usePermission } from './usePermission';
import { LoginScreen } from './LoginScreen';

/** 登录守卫：加载中转圈，未认证呈现登录壳。 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useSession();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Spin tip={t('auth.signingIn')} size="large">
          <div style={{ width: 120, height: 120 }} />
        </Spin>
      </div>
    );
  }
  if (!isAuthenticated) return <LoginScreen />;
  return <>{children}</>;
}

/** 路由级角色守卫：缺少角色呈现 403。 */
export function RequireRole({ roles, children }: { roles: readonly string[]; children: ReactNode }) {
  const { t } = useTranslation();
  const { can } = usePermission();
  const { signOut } = useSession();

  if (!can(roles)) {
    return (
      <Result
        status="403"
        title={t('auth.unauthorized')}
        subTitle={t('auth.unauthorizedDesc')}
        extra={<Button onClick={signOut}>{t('auth.signOut')}</Button>}
      />
    );
  }
  return <>{children}</>;
}
