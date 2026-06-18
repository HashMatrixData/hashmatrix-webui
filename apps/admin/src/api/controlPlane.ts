import { http } from '@hashmatrix/sdk';
import type { Tenant, Registration, ProvisionJob, Quota, Paged, LifecycleAction } from './types';

/**
 * control-plane 客户端（经共享 sdk 的 axios，baseURL 由运行期 config.js 的 api.baseUrl 提供）。
 * 当前由 msw mock 自含；接真实后端时仅替换 baseURL，无需改调用方。
 */

export const listTenants = (params: { current?: number; pageSize?: number; name?: string }) =>
  http.get<Paged<Tenant>>('/tenants', { params }).then((r) => r.data);

export const getTenant = (id: string) => http.get<Tenant>(`/tenants/${id}`).then((r) => r.data);

export const tenantLifecycle = (id: string, action: LifecycleAction) =>
  http.post<Tenant>(`/tenants/${id}/lifecycle`, { action }).then((r) => r.data);

export const listRegistrations = () => http.get<Registration[]>('/registrations').then((r) => r.data);

export const approveRegistration = (id: string) =>
  http.post<Registration>(`/registrations/${id}/approve`).then((r) => r.data);

export const rejectRegistration = (id: string) =>
  http.post<Registration>(`/registrations/${id}/reject`).then((r) => r.data);

export const listProvisionJobs = () => http.get<ProvisionJob[]>('/provision-jobs').then((r) => r.data);

export const listQuotas = () => http.get<Quota[]>('/quotas').then((r) => r.data);

export const updateQuota = (
  tenantId: string,
  patch: Partial<Pick<Quota, 'cpu' | 'mem' | 'storage' | 'users'>>,
) => http.put<Quota>(`/quotas/${tenantId}`, patch).then((r) => r.data);
