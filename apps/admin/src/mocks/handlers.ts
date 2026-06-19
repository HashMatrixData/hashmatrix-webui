import { http, HttpResponse } from 'msw';
import { PROVISIONING, TENANTS } from './data';
import type { ApprovalDecision, Tenant } from '@/api/types';

// 可变副本：审批 / 生命周期操作即时反映到后续查询（react-query 失效后重取）。
const tenants: Tenant[] = TENANTS.map((t) => ({ ...t }));

// 部署级基路径（config.js api.baseUrl）+ 契约版本前缀。msw 据此拦截，免起真实后端。
const B = '*/control-plane/v1';

const MUTATED_AT = '2026-06-19T00:00:00Z';
const err = (status: number, code: string, message: string) =>
  HttpResponse.json({ code, message }, { status });

/** control-plane handlers——对齐契约 v1.2.0，admin story/E2E 自含数据。 */
export const handlers = [
  // 列出租户目录。M1 server 未实现 ?status 过滤/分页 → 仅做分页回包，状态过滤交前端（A）。
  http.get(`${B}/tenants`, ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
    const pageSize = Math.max(1, Number(url.searchParams.get('pageSize') ?? '20'));
    const start = (page - 1) * pageSize;
    return HttpResponse.json({
      items: tenants.slice(start, start + pageSize),
      page,
      pageSize,
      total: tenants.length,
    });
  }),

  http.get(`${B}/tenants/:tenantId`, ({ params }) => {
    const t = tenants.find((x) => x.tenantId === params.tenantId);
    return t ? HttpResponse.json(t) : err(404, 'TENANT_NOT_FOUND', 'tenant not found');
  }),

  // 审批裁决：approve→active（M1 同步开通直接回 active）/ reject→deleted（必填 reason）。
  http.post(`${B}/tenants/:tenantId/approval`, async ({ params, request }) => {
    const body = (await request.json()) as ApprovalDecision;
    const t = tenants.find((x) => x.tenantId === params.tenantId);
    if (!t) return err(404, 'TENANT_NOT_FOUND', 'tenant not found');
    if (t.status !== 'registered' && t.status !== 'approving') {
      return err(409, 'STATE_CONFLICT', `cannot approve from ${t.status}`);
    }
    if (body.decision === 'reject') {
      if (!body.reason?.trim()) return err(400, 'INVALID_APPROVAL', 'reason required for reject');
      t.status = 'deleted';
      t.statusReason = body.reason;
    } else {
      t.status = 'active';
      t.statusReason = '开通完成';
    }
    t.updatedAt = MUTATED_AT;
    return HttpResponse.json(t);
  }),

  // 注销（软删除）：行保留、置 deleted + statusReason 留痕。
  http.delete(`${B}/tenants/:tenantId`, async ({ params, request }) => {
    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    const t = tenants.find((x) => x.tenantId === params.tenantId);
    if (!t) return err(404, 'TENANT_NOT_FOUND', 'tenant not found');
    if (!['provisioning', 'active', 'suspended'].includes(t.status)) {
      return err(409, 'STATE_CONFLICT', `cannot delete from ${t.status}`);
    }
    t.status = 'deleted';
    t.statusReason = body.reason ?? '已注销';
    t.updatedAt = MUTATED_AT;
    return HttpResponse.json(t);
  }),

  http.post(`${B}/tenants/:tenantId/suspend`, async ({ params, request }) => {
    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    const t = tenants.find((x) => x.tenantId === params.tenantId);
    if (!t) return err(404, 'TENANT_NOT_FOUND', 'tenant not found');
    if (t.status !== 'active') return err(409, 'STATE_CONFLICT', `cannot suspend from ${t.status}`);
    t.status = 'suspended';
    if (body.reason?.trim()) t.statusReason = body.reason;
    t.updatedAt = MUTATED_AT;
    return HttpResponse.json(t);
  }),

  http.post(`${B}/tenants/:tenantId/resume`, ({ params }) => {
    const t = tenants.find((x) => x.tenantId === params.tenantId);
    if (!t) return err(404, 'TENANT_NOT_FOUND', 'tenant not found');
    if (t.status !== 'suspended') return err(409, 'STATE_CONFLICT', `cannot resume from ${t.status}`);
    t.status = 'active';
    t.updatedAt = MUTATED_AT;
    return HttpResponse.json(t);
  }),

  http.get(`${B}/tenants/:tenantId/provisioning`, ({ params }) => {
    const p = PROVISIONING[params.tenantId as string];
    return p ? HttpResponse.json(p) : err(404, 'PROVISIONING_NOT_FOUND', 'no provisioning record');
  }),
];
