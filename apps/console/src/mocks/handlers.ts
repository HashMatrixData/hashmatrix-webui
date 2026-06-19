import { http, HttpResponse } from 'msw';
import { DATASETS } from './datasets';
import { QUALITY_RULES } from './quality';

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
 */
export const handlers = [
  http.get('*/api/datasets', ({ request }) => HttpResponse.json(paginate(DATASETS, new URL(request.url)))),
  http.get('*/api/quality-rules', ({ request }) =>
    HttpResponse.json(paginate(QUALITY_RULES, new URL(request.url))),
  ),
];
