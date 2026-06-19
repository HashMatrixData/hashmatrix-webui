import { http } from '@hashmatrix/sdk';
import type {
  ApprovalDecision,
  ProvisioningStatus,
  Tenant,
  TenantList,
  TenantStatus,
} from './types';

/**
 * control-plane 客户端（经共享 sdk 的 axios，baseURL 由运行期 config.js 的 `api.baseUrl`=`/control-plane` 提供）。
 *
 * 契约：主仓 `contracts/openapi/control-plane-v1.yaml` **v1.2.0**。路径一律对齐契约的 `/v1/...`
 * （`/api` 前缀为部署细节，由网关 APISIX strip，不入契约）；单租户端点以 **`{tenantId}`**（= X-Tenant-Id 路由键）寻址，
 * 非内部 UUID。当前由 msw mock 自含；接真实后端时仅替换 baseURL，无需改调用方。
 */

/**
 * 列出租户目录（分页）。契约支持 `?status` 过滤，但 M1 control-plane 尚未实现服务端过滤/分页，
 * 待审 / 开通中等队列由各页**客户端按 status 过滤**（服务端过滤为 control-plane follow-up，webui 不阻塞）。
 */
export const listTenants = (params?: { status?: TenantStatus; page?: number; pageSize?: number }) =>
  http.get<TenantList>('/v1/tenants', { params }).then((r) => r.data);

export const getTenant = (tenantId: string) =>
  http.get<Tenant>(`/v1/tenants/${tenantId}`).then((r) => r.data);

/** 审批裁决：approve→开通（M1 可同步直接返回 active）/ reject→deleted（必填 reason，不可逆）。 */
export const decideApproval = (tenantId: string, decision: ApprovalDecision) =>
  http.post<Tenant>(`/v1/tenants/${tenantId}/approval`, decision).then((r) => r.data);

/** 注销租户（软删除，置 deleted + statusReason 留痕；行保留、仍在目录列出）。 */
export const deleteTenant = (tenantId: string, reason?: string) =>
  http.delete<Tenant>(`/v1/tenants/${tenantId}`, { data: { reason } }).then((r) => r.data);

/** 停用租户（active → suspended）。 */
export const suspendTenant = (tenantId: string, reason?: string) =>
  http.post<Tenant>(`/v1/tenants/${tenantId}/suspend`, { reason }).then((r) => r.data);

/** 恢复租户（suspended → active）。 */
export const resumeTenant = (tenantId: string) =>
  http.post<Tenant>(`/v1/tenants/${tenantId}/resume`).then((r) => r.data);

/** 查询单租户开通状态（整体 phase + 分步 steps）。 */
export const getProvisioningStatus = (tenantId: string) =>
  http.get<ProvisioningStatus>(`/v1/tenants/${tenantId}/provisioning`).then((r) => r.data);
