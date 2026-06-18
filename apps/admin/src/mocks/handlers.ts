import { http, HttpResponse } from 'msw';
import { TENANTS, REGISTRATIONS, PROVISION_JOBS, QUOTAS } from './data';
import type { Tenant, Registration, Quota, LifecycleAction } from '@/api/types';

// 可变副本：approve/reject/调配额/生命周期 操作即时反映到后续查询（react-query 失效后重取）。
const tenants: Tenant[] = TENANTS.map((t) => ({ ...t }));
const registrations: Registration[] = REGISTRATIONS.map((r) => ({ ...r }));
const quotas: Quota[] = QUOTAS.map((q) => ({ ...q }));

const B = '*/control-plane';

/** control-plane handlers——admin story/E2E 自含数据，免起真实后端。 */
export const handlers = [
  http.get(`${B}/tenants`, ({ request }) => {
    const url = new URL(request.url);
    const current = Number(url.searchParams.get('current') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const kw = (url.searchParams.get('name') ?? '').trim().toLowerCase();
    const filtered = kw ? tenants.filter((t) => t.name.toLowerCase().includes(kw)) : tenants;
    const start = (current - 1) * pageSize;
    return HttpResponse.json({ data: filtered.slice(start, start + pageSize), total: filtered.length });
  }),

  http.get(`${B}/tenants/:id`, ({ params }) => {
    const t = tenants.find((x) => x.id === params.id);
    return t ? HttpResponse.json(t) : new HttpResponse(null, { status: 404 });
  }),

  http.post(`${B}/tenants/:id/lifecycle`, async ({ params, request }) => {
    const { action } = (await request.json()) as { action: LifecycleAction };
    const t = tenants.find((x) => x.id === params.id);
    if (!t) return new HttpResponse(null, { status: 404 });
    t.status = action === 'enable' ? 'active' : action === 'disable' ? 'suspended' : 'deactivated';
    return HttpResponse.json(t);
  }),

  http.get(`${B}/registrations`, () => HttpResponse.json(registrations)),

  http.post(`${B}/registrations/:id/approve`, ({ params }) => {
    const r = registrations.find((x) => x.id === params.id);
    if (!r) return new HttpResponse(null, { status: 404 });
    r.status = 'approved';
    return HttpResponse.json(r);
  }),

  http.post(`${B}/registrations/:id/reject`, ({ params }) => {
    const r = registrations.find((x) => x.id === params.id);
    if (!r) return new HttpResponse(null, { status: 404 });
    r.status = 'rejected';
    return HttpResponse.json(r);
  }),

  http.get(`${B}/provision-jobs`, () => HttpResponse.json(PROVISION_JOBS)),

  http.get(`${B}/quotas`, () => HttpResponse.json(quotas)),

  http.put(`${B}/quotas/:tenantId`, async ({ params, request }) => {
    const patch = (await request.json()) as Partial<Pick<Quota, 'cpu' | 'mem' | 'storage' | 'users'>>;
    const q = quotas.find((x) => x.tenantId === params.tenantId);
    if (!q) return new HttpResponse(null, { status: 404 });
    Object.assign(q, patch);
    return HttpResponse.json(q);
  }),
];
