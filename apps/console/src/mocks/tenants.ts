import type { MembershipView } from '@/api/types';

/**
 * `GET /v1/me/tenants` mock：当前用户租户 membership（按契约 `MembershipView` 成形，非自拟字段）。
 * D1 数组——M1 先返回 1 个，schema 一律按多租户预留；脱敏占位 `tenant-demo`（demo 下 `tenantKey` = `tenantId`）。
 * 与 control-plane 同缝另一端锚同一 schema（registry: openapi/control-plane-v1），避免 I4 集成对不上。
 */
export const MY_TENANTS: MembershipView[] = [
  {
    tenantId: 'tenant-demo',
    tenantKey: 'tenant-demo',
    displayName: 'Demo Tenant',
    status: 'active',
    roles: ['tenant-admin'],
  },
];
