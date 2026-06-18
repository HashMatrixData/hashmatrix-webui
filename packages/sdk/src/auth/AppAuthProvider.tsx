import type { ReactNode } from 'react';
import { AuthProvider as OidcAuthProvider } from 'react-oidc-context';
import { MockSessionProvider } from './MockSessionProvider';
import { OidcSessionProvider } from './OidcSessionProvider';
import { AuthMisconfigured } from './AuthMisconfigured';
import { buildOidcConfig, isOidcEnabled } from './oidcConfig';

/**
 * 鉴权装配入口（登录壳）：
 * - 运行期注入了 oidc.authority → 真实 Keycloak OIDC（生产路径）。
 * - 否则且处于开发期（import.meta.env.DEV）→ mock 会话（本地/离线便利）。
 * - 否则（生产构建却未配置鉴权）→ 明确报错，不放行（杜绝 mock-admin fail-open）。
 *
 * 注：Storybook/E2E 直接使用 MockSessionProvider 作夹具，不经本入口。
 */
export function AppAuthProvider({ children }: { children: ReactNode }) {
  if (isOidcEnabled()) {
    return (
      <OidcAuthProvider {...buildOidcConfig()}>
        <OidcSessionProvider>{children}</OidcSessionProvider>
      </OidcAuthProvider>
    );
  }
  if (import.meta.env.DEV) {
    return <MockSessionProvider>{children}</MockSessionProvider>;
  }
  return <AuthMisconfigured />;
}
