import { http, HttpResponse } from 'msw';
import { DATASETS } from './datasets';
import { TYPEDEFS, type TypeDef, type TypeDefInput } from './typedefs';

/** mock「服务端」为新建元类派生的固定时间戳（确定性，便于 E2E）。 */
const MOCK_CREATED_AT = '2026-06-22T00:00:00.000Z';

/**
 * msw handlers——使 story / E2E 自含数据，免起后端环境（spec 质量门）。
 * /api/datasets：服务端分页（呼应大数据量表格策略）。
 * /api/meta/typedefs：元模型（TypeDef）检索 + 新建/编辑（governance 引擎 post-M1，前端先行 mock）。
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

  http.get('*/api/meta/typedefs', ({ request }) => {
    const url = new URL(request.url);
    const current = Number(url.searchParams.get('current') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const keyword = (url.searchParams.get('keyword') ?? '').trim().toLowerCase();
    const category = (url.searchParams.get('category') ?? '').trim();

    const filtered = TYPEDEFS.filter((d) => {
      const hitKeyword =
        !keyword ||
        d.name.toLowerCase().includes(keyword) ||
        d.displayName.toLowerCase().includes(keyword);
      const hitCategory = !category || d.category === category;
      return hitKeyword && hitCategory;
    });
    const start = (current - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json({ data, total: filtered.length, success: true });
  }),

  // 新建元类：编码唯一门控（#9）；服务端落 TENANT/DRAFT（#10 作用域 / #8 生命周期）。
  http.post('*/api/meta/typedefs', async ({ request }) => {
    const input = (await request.json()) as TypeDefInput;
    if (TYPEDEFS.some((d) => d.name === input.name)) {
      return HttpResponse.json({ message: `编码已存在：${input.name}` }, { status: 409 });
    }
    const created: TypeDef = {
      ...input,
      scope: 'TENANT',
      status: 'DRAFT',
      version: 1,
      updatedAt: MOCK_CREATED_AT,
    };
    TYPEDEFS.push(created);
    return HttpResponse.json({ data: created, success: true }, { status: 201 });
  }),

  // 编辑元类：仅租户私有（TENANT）可改；平台公共（PLATFORM）共享只读（#10）。
  http.put('*/api/meta/typedefs/:name', async ({ request, params }) => {
    const name = String(params.name);
    const idx = TYPEDEFS.findIndex((d) => d.name === name);
    if (idx < 0) {
      return HttpResponse.json({ message: `元类不存在：${name}` }, { status: 404 });
    }
    if (TYPEDEFS[idx].scope === 'PLATFORM') {
      return HttpResponse.json({ message: '平台公共元模型共享只读，不可编辑' }, { status: 403 });
    }
    const input = (await request.json()) as TypeDefInput;
    // 编码不可改：以路径 name 为准；保留作用域/状态/版本。
    const updated: TypeDef = {
      ...TYPEDEFS[idx],
      displayName: input.displayName,
      category: input.category,
      superTypes: input.superTypes,
      description: input.description,
      attributeDefs: input.attributeDefs,
    };
    TYPEDEFS[idx] = updated;
    return HttpResponse.json({ data: updated, success: true });
  }),
];
