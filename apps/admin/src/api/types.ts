/**
 * control-plane 领域类型（管理平面对接）。
 *
 * 单一事实源：主仓契约 `contracts/openapi/control-plane-v1.yaml` **v1.2.0**
 * （webui 为该契约唯一登记 consumer，按「tolerant reader」吸收 wire 形态）。
 * 脱敏：租户名一律 tenant-* / example.com 占位，无任何真实甲方信息。
 */

/**
 * 租户目录状态机：`registered → approving → provisioning → active → suspended → deleted`。
 * tolerant reader：渲染端对未知状态须降级处理（见各页 STATUS_COLOR/statusLabel 的 fallback），
 * 不把任一中间态写死为必经路径（如 approve 在 M1 可同步直接返回 `active`，不经 `provisioning`）。
 */
export type TenantStatus =
  | 'registered'
  | 'approving'
  | 'provisioning'
  | 'active'
  | 'suspended'
  | 'deleted';

/** Keycloak Organization 引用（开通时建立；身份隔离 = 单 realm，org = 租户）。 */
export interface OrganizationRef {
  orgId?: string;
  orgAlias?: string;
}

/** 数据平面接入信息（开通后回写；租户 deleted 后仅作历史快照，不可再路由）。 */
export interface DataPlaneRef {
  namespace?: string;
  dbSchema?: string;
  dorisCatalog?: string;
  helmRelease?: string;
}

/** 计算配额（对应 K8s ResourceQuota）。 */
export interface ComputeQuota {
  cpuCores?: number;
  memoryGi?: number;
}

/**
 * 配额额度（硬限）。compute 对应 K8s ResourceQuota，其余为业务配额。
 * M1 仅承载额度（spec）；用量（usage）与 `GET /v1/tenants/{tenantId}/quota` 端点为后置
 * （计量计费仅预留、不按量），故本仓暂不建 QuotaStatus/QuotaUsage 类型与用量条。
 */
export interface QuotaSpec {
  maxUsers?: number;
  maxStorageGi?: number;
  maxConcurrentJobs?: number;
  compute?: ComputeQuota;
}

/** 租户目录条目（控制平面回写的状态 / 配额 / 接入信息）。 */
export interface Tenant {
  /** 稳定租户标识（= X-Tenant-Id 路由键；数据·计算隔离的权威键）。 */
  tenantId: string;
  displayName: string;
  status: TenantStatus;
  organization?: OrganizationRef;
  dataPlane?: DataPlaneRef;
  quota?: QuotaSpec;
  /** 最近一次状态流转的原因 / 失败详情（审计与排障；驳回理由、挂起原因、开通失败步骤等）。 */
  statusReason?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 自助注册请求体（`POST /v1/tenants`）。
 * 交付形态为部署级、不入契约——故注册体**不**含 deliveryMode（由控制平面据部署配置推导）。
 * admin 平面仅读取/展示租户目录，不构造注册体；此类型为契约消费方视图与 SDK 形态。
 */
export interface TenantRegistration {
  tenantId: string;
  displayName: string;
  adminEmail: string;
  requestedQuota?: QuotaSpec;
}

/** 租户目录分页（`GET /v1/tenants`）。 */
export interface TenantList {
  items: Tenant[];
  page: number;
  pageSize: number;
  total: number;
}

export type ApprovalDecisionValue = 'approve' | 'reject';

/** 审批裁决体（`POST /v1/tenants/{tenantId}/approval`）。reject 时 reason 必填（驳回置 deleted 不可逆）。 */
export interface ApprovalDecision {
  decision: ApprovalDecisionValue;
  reason?: string;
}

export type ProvisioningPhase = 'pending' | 'in_progress' | 'succeeded' | 'failed';
export type ProvisioningTarget = 'keycloak' | 'helm' | 'datastore' | 'secrets';
export type ProvisioningStepStatus = 'pending' | 'in_progress' | 'succeeded' | 'failed' | 'skipped';

/** 单个外呼开通步骤（target 对应控制平面外呼边界，见 provisioning ICD）。 */
export interface ProvisioningStep {
  target: ProvisioningTarget;
  status: ProvisioningStepStatus;
  message?: string;
  updatedAt?: string;
}

/** 命令式开通 / 注销 deprovision 的整体阶段与分步进度（`GET /v1/tenants/{tenantId}/provisioning`）。 */
export interface ProvisioningStatus {
  tenantId: string;
  phase: ProvisioningPhase;
  startedAt?: string;
  finishedAt?: string;
  steps: ProvisioningStep[];
}

/** 生命周期操作的可选理由体（suspend / delete）。 */
export interface ReasonRequest {
  reason?: string;
}
