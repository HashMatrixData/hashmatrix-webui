import { http } from '@hashmatrix/sdk';
import type { MembershipView } from './types';

/**
 * control-plane 客户端（经共享 `@hashmatrix/sdk` 的 axios；baseURL 由运行期 `config.js` 提供）。
 * 仿 `apps/admin/src/api/controlPlane.ts`：当前由 msw mock 自含，接真实后端仅换 baseURL / 网关路由，
 * 调用方不变。control-plane 为**跨租户单例**，经网关 APISIX 校验 JWT 后访问。
 *
 * 注：`/v1/me/tenants` 据 JWT 主体（`sub`）跨租户解析，契约**不要求**调用方携带 `X-Tenant-*`
 * （用户可能尚未选定活动租户或正要切换；见 `icd/tenant-context-headers` §3.4）。sdk 拦截器在有会话租户时
 * 仍会附 `X-Tenant-Id`，对本端点无害（control-plane 按主体解析，忽略之）。
 */

/** 列出当前用户的租户 membership（契约 `GET /v1/me/tenants`；D1 数组——M1 先 1 个，结构按多租户）。 */
export const listMyTenants = () =>
  http.get<MembershipView[]>('/v1/me/tenants').then((r) => r.data);
