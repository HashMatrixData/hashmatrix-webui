/**
 * 可插拔访问令牌提供者：解耦 axios 与具体鉴权实现（OIDC / mock）。
 * 鉴权层在登录后注入 provider；http 拦截器据此附加 Bearer。
 */
type TokenProvider = () => string | undefined;

let tokenProvider: TokenProvider = () => undefined;

export function setAuthTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider;
}

export function getAccessToken(): string | undefined {
  return tokenProvider();
}
