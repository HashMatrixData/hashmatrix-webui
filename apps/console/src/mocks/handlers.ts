import { http, HttpResponse } from 'msw';
import { DATASETS } from './datasets';
import { QUALITY_RULES } from './quality';
import { MY_TENANTS } from './tenants';
import { ORG_MEMBERS } from './orgMembers';
import { ORG_ROLES } from './orgRoles';
import { ORG_GROUPS } from './orgGroups';

/** 服务端分页 + 按 name 模糊过滤（呼应大数据量表格策略）。 */
function paginate<T extends { name: string }>(rows: T[], url: URL) {
  const current = Number(url.searchParams.get('current') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
  const keyword = (url.searchParams.get('name') ?? '').trim().toLowerCase();

  const filtered = keyword ? rows.filter((r) => r.name.toLowerCase().includes(keyword)) : rows;
  const start = (current - 1) * pageSize;
  return { data: filtered.slice(start, start + pageSize), total: filtered.length, success: true };
}

/**
 * msw handlers——使 story / E2E 自含数据，免起后端环境（spec 质量门）。
 * - /api/datasets：数据资产目录（数据地图复用）。
 * - /api/quality-rules：质量规则执行明细（质量大盘）。
 * - /api/org/{members,roles,groups}：组织管理（#14 · 租户自管理；演示数据脱敏占位）。
 * - /v1/me/tenants：当前用户租户 membership（control-plane 契约；租户切换器取数）。
 */
export const handlers = [
  http.get('*/api/datasets', ({ request }) => HttpResponse.json(paginate(DATASETS, new URL(request.url)))),
  http.get('*/api/quality-rules', ({ request }) =>
    HttpResponse.json(paginate(QUALITY_RULES, new URL(request.url))),
  ),
  http.get('*/api/org/members', ({ request }) => HttpResponse.json(paginate(ORG_MEMBERS, new URL(request.url)))),
  http.get('*/api/org/roles', ({ request }) => HttpResponse.json(paginate(ORG_ROLES, new URL(request.url)))),
  http.get('*/api/org/groups', ({ request }) => HttpResponse.json(paginate(ORG_GROUPS, new URL(request.url)))),
  // control-plane 跨租户单例端点；`*` 前缀吞掉运行期 baseURL（console 默认 /api），匹配契约路径 /v1/me/tenants。
  http.get('*/v1/me/tenants', () => HttpResponse.json(MY_TENANTS)),
];
