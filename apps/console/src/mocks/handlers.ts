import { http, HttpResponse } from 'msw';
import { DATASETS } from './datasets';

/**
 * msw handlers——使 story / E2E 自含数据，免起后端环境（spec 质量门）。
 * /api/datasets：服务端分页（呼应大数据量表格策略）。
 */
export const handlers = [
  http.get('*/api/datasets', ({ request }) => {
    const url = new URL(request.url);
    const current = Number(url.searchParams.get('current') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const keyword = (url.searchParams.get('name') ?? '').trim().toLowerCase();

    const filtered = keyword ? DATASETS.filter((d) => d.name.toLowerCase().includes(keyword)) : DATASETS;
    const start = (current - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json({ data, total: filtered.length, success: true });
  }),
];
