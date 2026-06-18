/** control-plane 领域类型（管理平面对接）。脱敏：租户名一律 tenant-* 占位。 */

export type TenantStatus = 'active' | 'suspended' | 'deactivated';

export interface Tenant {
  id: string;
  name: string;
  org: string;
  plan: 'free' | 'standard' | 'enterprise';
  status: TenantStatus;
  createdAt: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Registration {
  id: string;
  tenantName: string;
  org: string;
  requestedPlan: Tenant['plan'];
  requestedAt: string;
  status: ApprovalStatus;
}

export type ProvisionStatus = 'running' | 'succeeded' | 'failed';

export interface ProvisionJob {
  tenantId: string;
  tenantName: string;
  step: string;
  progress: number;
  status: ProvisionStatus;
}

export interface QuotaDimension {
  used: number;
  limit: number;
}

export interface Quota {
  tenantId: string;
  tenantName: string;
  cpu: QuotaDimension;
  mem: QuotaDimension;
  storage: QuotaDimension;
  users: QuotaDimension;
}

export interface Paged<T> {
  data: T[];
  total: number;
}

export type LifecycleAction = 'enable' | 'disable' | 'deregister';
