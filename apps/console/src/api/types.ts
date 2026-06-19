/**
 * control-plane 北向契约类型（使用平面消费方 · tolerant reader）。
 * 锚定主仓契约 `contracts/openapi/control-plane-v1.yaml`（registry: openapi/control-plane-v1；
 * `/v1/me/tenants` 自 v1.1.0 引入，schema 至今未变）。
 * `packages/sdk` 由契约生成类型落地后，本手写副本应替换为生成类型，避免双源漂移。
 */

/** 租户目录状态机（权威枚举见契约 `TenantStatus`；迁移规则见 provisioning ICD）。 */
export type TenantStatus =
  | 'registered'
  | 'approving'
  | 'provisioning'
  | 'active'
  | 'suspended'
  | 'deleted';

/**
 * 当前用户在某租户的成员资格视图（契约 `MembershipView` · D1：单 User + 多 Org Membership）。
 * 切换到该租户走 D2：以 `tenantKey` 向 Keycloak 重新换取 org-scoped token，`X-Tenant-Id` 始终唯一。
 */
export interface MembershipView {
  /** 稳定租户标识（= `X-Tenant-Id` 路由键；数据·计算隔离的权威键）。 */
  tenantId: string;
  /** Keycloak Organization 别名键（切换租户时据此申请 org-scoped token）；demo 下取值 = `tenantId`。 */
  tenantKey: string;
  /** 租户显示名。 */
  displayName: string;
  status: TenantStatus;
  /** 当前用户在该租户的角色（可选 · M1 实现可不返回；tolerant reader 缺省不报错）。 */
  roles?: string[];
}
