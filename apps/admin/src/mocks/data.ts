import type { Tenant, Registration, ProvisionJob, Quota } from '@/api/types';

/** control-plane mock 数据（脱敏：通用 tenant-* 占位，无任何真实甲方信息）。确定性、可断言。 */

export const TENANTS: Tenant[] = [
  { id: 't_001', name: 'tenant-acme', org: 'org-acme', plan: 'enterprise', status: 'active', createdAt: '2025-11-02' },
  { id: 't_002', name: 'tenant-demo', org: 'org-demo', plan: 'standard', status: 'active', createdAt: '2025-12-15' },
  { id: 't_003', name: 'tenant-globex', org: 'org-globex', plan: 'standard', status: 'suspended', createdAt: '2026-01-08' },
  { id: 't_004', name: 'tenant-initech', org: 'org-initech', plan: 'free', status: 'active', createdAt: '2026-02-20' },
  { id: 't_005', name: 'tenant-umbrella', org: 'org-umbrella', plan: 'enterprise', status: 'deactivated', createdAt: '2026-03-11' },
];

export const REGISTRATIONS: Registration[] = [
  { id: 'r_101', tenantName: 'tenant-soylent', org: 'org-soylent', requestedPlan: 'standard', requestedAt: '2026-06-01', status: 'pending' },
  { id: 'r_102', tenantName: 'tenant-hooli', org: 'org-hooli', requestedPlan: 'enterprise', requestedAt: '2026-06-03', status: 'pending' },
  { id: 'r_103', tenantName: 'tenant-piedpiper', org: 'org-piedpiper', requestedPlan: 'free', requestedAt: '2026-05-28', status: 'approved' },
];

export const PROVISION_JOBS: ProvisionJob[] = [
  { tenantId: 't_006', tenantName: 'tenant-soylent', step: 'schema 初始化', progress: 60, status: 'running' },
  { tenantId: 't_007', tenantName: 'tenant-hooli', step: 'namespace 创建', progress: 30, status: 'running' },
  { tenantId: 't_009', tenantName: 'tenant-stark', step: '完成', progress: 100, status: 'succeeded' },
  { tenantId: 't_008', tenantName: 'tenant-vehement', step: 'Keycloak org 绑定', progress: 45, status: 'failed' },
];

export const QUOTAS: Quota[] = [
  { tenantId: 't_001', tenantName: 'tenant-acme', cpu: { used: 28, limit: 64 }, mem: { used: 96, limit: 256 }, storage: { used: 1200, limit: 4096 }, users: { used: 420, limit: 1000 } },
  { tenantId: 't_002', tenantName: 'tenant-demo', cpu: { used: 6, limit: 16 }, mem: { used: 18, limit: 64 }, storage: { used: 220, limit: 1024 }, users: { used: 48, limit: 200 } },
  { tenantId: 't_004', tenantName: 'tenant-initech', cpu: { used: 2, limit: 4 }, mem: { used: 5, limit: 16 }, storage: { used: 60, limit: 256 }, users: { used: 9, limit: 50 } },
];
