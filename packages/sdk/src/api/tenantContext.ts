/**
 * 可插拔租户提供者：解耦 axios 与会话来源（OIDC token `tenant` 声明 / mock seed）。
 * 鉴权层在会话就绪后注入 provider；http 拦截器据此派生 X-Tenant-Id（D2：会话是唯一源）。
 * 无会话租户时 provider 返回 undefined → 拦截器不附该头（跨租户 / 未登录请求不伪造租户）。
 * 与 authToken.ts 同构（鉴权 Bearer 与租户头各自解耦）。
 */
type TenantProvider = () => string | undefined;

let tenantProvider: TenantProvider = () => undefined;

export function setTenantProvider(provider: TenantProvider): void {
  tenantProvider = provider;
}

export function getCurrentTenant(): string | undefined {
  return tenantProvider();
}
