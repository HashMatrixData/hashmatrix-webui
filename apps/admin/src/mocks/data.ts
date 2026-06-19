import type { ProvisioningStatus, Tenant } from '@/api/types';

/**
 * control-plane mock 数据（脱敏：通用 tenant-* / org-* / example.com 占位，无任何真实甲方信息）。
 * 确定性、可断言。形态对齐契约 v1.2.0：嵌套 organization / dataPlane / quota，6 态状态机。
 * 覆盖全部状态以便各页客户端过滤（registered/approving 待审、provisioning 开通、deleted 可见历史）。
 */

const quota = (
  maxUsers: number,
  maxStorageGi: number,
  maxConcurrentJobs: number,
  cpuCores: number,
  memoryGi: number,
): Tenant['quota'] => ({ maxUsers, maxStorageGi, maxConcurrentJobs, compute: { cpuCores, memoryGi } });

const refs = (alias: string): Pick<Tenant, 'organization' | 'dataPlane'> => ({
  organization: { orgId: `00000000-0000-4000-8000-${alias.replace(/[^0-9a-f]/g, '').padStart(12, '0').slice(-12)}`, orgAlias: alias },
  dataPlane: {
    namespace: alias,
    dbSchema: alias.replace(/-/g, '_'),
    dorisCatalog: alias.replace(/-/g, '_'),
    helmRelease: alias,
  },
});

export const TENANTS: Tenant[] = [
  {
    tenantId: 'tenant-acme',
    displayName: 'Acme Demo',
    status: 'active',
    ...refs('tenant-acme'),
    quota: quota(1000, 4096, 20, 64, 256),
    statusReason: '开通完成',
    createdAt: '2025-11-02T08:00:00Z',
    updatedAt: '2025-11-02T08:05:00Z',
  },
  {
    tenantId: 'tenant-demo',
    displayName: 'Demo Tenant',
    status: 'active',
    ...refs('tenant-demo'),
    quota: quota(200, 1024, 10, 16, 64),
    createdAt: '2025-12-15T03:20:00Z',
  },
  {
    tenantId: 'tenant-globex',
    displayName: 'Globex Demo',
    status: 'suspended',
    ...refs('tenant-globex'),
    quota: quota(200, 1024, 10, 16, 64),
    statusReason: '欠费暂停（演示）',
    createdAt: '2026-01-08T11:00:00Z',
  },
  {
    tenantId: 'tenant-initech',
    displayName: 'Initech Demo',
    status: 'active',
    ...refs('tenant-initech'),
    quota: quota(50, 256, 4, 4, 16),
    createdAt: '2026-02-20T09:30:00Z',
  },
  {
    // 待审：自助注册落为一条 status=registered 的 Tenant（无独立 registrations 资源）。
    tenantId: 'tenant-soylent',
    displayName: 'Soylent Demo',
    status: 'registered',
    organization: { orgAlias: 'tenant-soylent' },
    quota: quota(100, 512, 8, 8, 32),
    createdAt: '2026-06-01T06:00:00Z',
  },
  {
    tenantId: 'tenant-hooli',
    displayName: 'Hooli Demo',
    status: 'approving',
    organization: { orgAlias: 'tenant-hooli' },
    quota: quota(500, 2048, 16, 32, 128),
    createdAt: '2026-06-03T07:15:00Z',
  },
  {
    // 开通中：phase in_progress（见 PROVISIONING）。
    tenantId: 'tenant-stark',
    displayName: 'Stark Demo',
    status: 'provisioning',
    ...refs('tenant-stark'),
    quota: quota(500, 2048, 16, 32, 128),
    createdAt: '2026-06-10T02:00:00Z',
  },
  {
    // 开通失败：停在 provisioning（phase failed），可重试。
    tenantId: 'tenant-vehement',
    displayName: 'Vehement Demo',
    status: 'provisioning',
    organization: { orgAlias: 'tenant-vehement' },
    quota: quota(50, 256, 4, 4, 16),
    statusReason: 'helm release 应用失败（演示）',
    createdAt: '2026-06-12T05:40:00Z',
  },
  {
    // 已驳回/已注销：软删除，行保留 + statusReason 留痕，仍在目录列出（C）。
    tenantId: 'tenant-umbrella',
    displayName: 'Umbrella Demo',
    status: 'deleted',
    organization: { orgAlias: 'tenant-umbrella' },
    statusReason: '驳回：演示资料不完整',
    createdAt: '2026-03-11T10:00:00Z',
    updatedAt: '2026-03-12T10:00:00Z',
  },
];

/** 单租户开通状态（仅 provisioning 态租户有意义）。keyed by tenantId。 */
export const PROVISIONING: Record<string, ProvisioningStatus> = {
  'tenant-stark': {
    tenantId: 'tenant-stark',
    phase: 'in_progress',
    startedAt: '2026-06-10T02:01:00Z',
    steps: [
      { target: 'keycloak', status: 'succeeded', message: 'organization created', updatedAt: '2026-06-10T02:02:00Z' },
      { target: 'helm', status: 'in_progress', message: 'applying per-tenant release', updatedAt: '2026-06-10T02:03:00Z' },
      { target: 'datastore', status: 'pending' },
      { target: 'secrets', status: 'pending' },
    ],
  },
  'tenant-vehement': {
    tenantId: 'tenant-vehement',
    phase: 'failed',
    startedAt: '2026-06-12T05:41:00Z',
    finishedAt: '2026-06-12T05:44:00Z',
    steps: [
      { target: 'keycloak', status: 'succeeded', message: 'organization created', updatedAt: '2026-06-12T05:42:00Z' },
      { target: 'helm', status: 'failed', message: 'release apply timeout', updatedAt: '2026-06-12T05:44:00Z' },
      { target: 'datastore', status: 'skipped' },
      { target: 'secrets', status: 'skipped' },
    ],
  },
};
