import { WebStorageStateStore } from 'oidc-client-ts';
import type { AuthProviderProps } from 'react-oidc-context';
import { getRuntimeConfig } from '@hashmatrix/brand';

/**
 * 由运行期配置（window.__CONFIG__.oidc）构造 Keycloak OIDC 参数，对接网关。
 * 部署期通过 config.js 注入 authority/clientId（见 deploy/config.js.template）。
 */
export function buildOidcConfig(): AuthProviderProps {
  const oidc = getRuntimeConfig().oidc ?? {};
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  return {
    authority: oidc.authority ?? '',
    client_id: oidc.clientId ?? 'hashmatrix-webui',
    redirect_uri: oidc.redirectUri ?? origin,
    post_logout_redirect_uri: oidc.postLogoutRedirectUri ?? origin,
    scope: oidc.scope ?? 'openid profile email',
    // 登录回调后清理 URL 上的 code/state，避免刷新重复处理。
    onSigninCallback: () => {
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    },
    userStore:
      typeof window !== 'undefined' ? new WebStorageStateStore({ store: window.localStorage }) : undefined,
  };
}

/**
 * 是否启用真实 OIDC——**纯运行期**判定：以 window.__CONFIG__.oidc.authority 是否注入为准。
 * 与 brand/api 同属一套运行期配置模型（spec D3：一份镜像、运行期注入、免重建）。
 * 不依赖任何构建期开关，避免「镜像烘焙的标志导致运行期无法启用鉴权」的 fail-open。
 */
export function isOidcEnabled(): boolean {
  return Boolean(getRuntimeConfig().oidc?.authority?.trim());
}
