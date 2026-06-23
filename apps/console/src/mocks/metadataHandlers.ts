/**
 * 元数据管理 msw handlers（governance 元模型引擎 post-M1，前端 mock-first）。
 * 自成一文件，由 handlers.ts 展开合入；data 文件就地可变 + reset 见各 mock。
 */
import { http, HttpResponse } from 'msw';
import { TYPEDEFS, type TypeDef, type TypeDefInput } from './typedefs';
import { TYPEDEF_VERSIONS, recordVersion, type TypeDefVersion } from './typedefVersions';
import { RELATIONSHIPS } from './relationships';
import { CLASSIFICATIONS, findClassification, type ClassificationNode } from './classifications';
import { TEMPLATES } from './templates';
import { validateModel } from './validation';
import { INSTANCES, INSTANCE_HISTORY } from './instances';
import { LINEAGE_GRAPH } from './lineage';
import { COLLECT_SOURCES, SCAN_RUNS, runScan } from './collect';
import { CHANGE_EVENTS } from './events';

/** mock「当前用户」（认领人占位，脱敏）。 */
const MOCK_CURRENT_USER = 'tenant-demo';
/** mock「服务端」为新建元类派生的固定时间戳（确定性，便于 E2E）。 */
const MOCK_CREATED_AT = '2026-06-22T00:00:00.000Z';

export const metadataHandlers = [
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

  // 元类版本历史（#8）：返回 vN 变更记录；无记录则由当前态派生单条。
  http.get('*/api/meta/typedefs/:name/versions', ({ params }) => {
    const name = String(params.name);
    const td = TYPEDEFS.find((d) => d.name === name);
    const seeded = TYPEDEF_VERSIONS[name];
    const data: TypeDefVersion[] =
      seeded ??
      (td
        ? [{ version: td.version, status: td.status, changedAt: td.updatedAt, summary: '当前版本' }]
        : []);
    return HttpResponse.json({ data, success: true });
  }),

  // 元类发布（#8）：仅租户私有草稿可发布；平台公共只读→403，已发布→409。
  http.post('*/api/meta/typedefs/:name/publish', ({ params }) => {
    const name = String(params.name);
    const idx = TYPEDEFS.findIndex((d) => d.name === name);
    if (idx < 0) {
      return HttpResponse.json({ message: `元类不存在：${name}` }, { status: 404 });
    }
    if (TYPEDEFS[idx].scope === 'PLATFORM') {
      return HttpResponse.json({ message: '平台公共元模型共享只读，不可操作' }, { status: 403 });
    }
    if (TYPEDEFS[idx].status === 'PUBLISHED') {
      return HttpResponse.json({ message: '该元类已发布' }, { status: 409 });
    }
    const published: TypeDef = { ...TYPEDEFS[idx], status: 'PUBLISHED', updatedAt: MOCK_CREATED_AT };
    TYPEDEFS[idx] = published;
    recordVersion(name, {
      version: published.version,
      status: 'PUBLISHED',
      changedAt: MOCK_CREATED_AT,
      summary: '发布草稿',
    });
    return HttpResponse.json({ data: published, success: true });
  }),

  // 关系定义检索（#7）：服务端分页 + keyword / relationshipType 过滤。
  http.get('*/api/meta/relationships', ({ request }) => {
    const url = new URL(request.url);
    const current = Number(url.searchParams.get('current') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const keyword = (url.searchParams.get('keyword') ?? '').trim().toLowerCase();
    const relationshipType = (url.searchParams.get('relationshipType') ?? '').trim();

    const filtered = RELATIONSHIPS.filter((r) => {
      const hitKeyword =
        !keyword ||
        r.name.toLowerCase().includes(keyword) ||
        r.displayName.toLowerCase().includes(keyword);
      const hitType = !relationshipType || r.relationshipType === relationshipType;
      return hitKeyword && hitType;
    });
    const start = (current - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json({ data, total: filtered.length, success: true });
  }),

  // 分类树读取（#6）：返回整棵树。
  http.get('*/api/meta/classifications', () => {
    return HttpResponse.json({ data: CLASSIFICATIONS, success: true });
  }),

  // 分类树扩展（#6/#10）：在指定父节点下新增 TENANT 私有子分类；同级编码唯一。
  http.post('*/api/meta/classifications', async ({ request }) => {
    const body = (await request.json()) as {
      parentKey: string;
      name: string;
      displayName: string;
      description?: string;
    };
    const parent = findClassification(CLASSIFICATIONS, body.parentKey);
    if (!parent) {
      return HttpResponse.json({ message: `父分类不存在：${body.parentKey}` }, { status: 404 });
    }
    parent.children ??= [];
    if (parent.children.some((c) => c.name === body.name)) {
      return HttpResponse.json({ message: `同级编码已存在：${body.name}` }, { status: 409 });
    }
    const created: ClassificationNode = {
      key: `${parent.key}.${body.name}`,
      name: body.name,
      displayName: body.displayName,
      scope: 'TENANT',
      description: body.description,
    };
    parent.children.push(created);
    return HttpResponse.json({ data: created, success: true }, { status: 201 });
  }),

  // 模板库列表（#11）：标准模型族。
  http.get('*/api/meta/templates', () => {
    return HttpResponse.json({ data: TEMPLATES, success: true });
  }),

  // 模板导入（#11）：批量建 typedef 落 TENANT/DRAFT；已存在的编码跳过，返回汇总。
  http.post('*/api/meta/templates/:key/import', ({ params }) => {
    const key = String(params.key);
    const template = TEMPLATES.find((tpl) => tpl.key === key);
    if (!template) {
      return HttpResponse.json({ message: `模板不存在：${key}` }, { status: 404 });
    }
    let created = 0;
    let skipped = 0;
    // 隐式契约：模板内 typeDefs 须父类先于子类排列，使 superTypes 继承链在逐条建库时自洽。
    for (const input of template.typeDefs) {
      if (TYPEDEFS.some((d) => d.name === input.name)) {
        skipped += 1;
        continue;
      }
      TYPEDEFS.push({ ...input, scope: 'TENANT', status: 'DRAFT', version: 1, updatedAt: MOCK_CREATED_AT });
      created += 1;
    }
    return HttpResponse.json({ data: { created, skipped, total: template.typeDefs.length }, success: true });
  }),

  // 一致性校验（#9）：扫描当前元模型，返回问题清单 + 规则命中汇总。
  http.get('*/api/meta/validate', () => {
    return HttpResponse.json({ data: validateModel(), success: true });
  }),

  // 元数据实例检索（#13）：服务端分页 + keyword / typeName 过滤。
  http.get('*/api/meta/instances', ({ request }) => {
    const url = new URL(request.url);
    const current = Number(url.searchParams.get('current') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const keyword = (url.searchParams.get('keyword') ?? '').trim().toLowerCase();
    const typeName = (url.searchParams.get('typeName') ?? '').trim();

    const filtered = INSTANCES.filter((it) => {
      const hitKeyword =
        !keyword ||
        it.qualifiedName.toLowerCase().includes(keyword) ||
        it.displayName.toLowerCase().includes(keyword);
      const hitType = !typeName || it.typeName === typeName;
      return hitKeyword && hitType;
    });
    const start = (current - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json({ data, total: filtered.length, success: true });
  }),

  // 实例历史快照（#13）。
  http.get('*/api/meta/instances/:guid/history', ({ params }) => {
    const guid = String(params.guid);
    return HttpResponse.json({ data: INSTANCE_HISTORY[guid] ?? [], success: true });
  }),

  // 实例认领（#13）：未认领→落当前用户；已认领→409。
  http.post('*/api/meta/instances/:guid/claim', ({ params }) => {
    const guid = String(params.guid);
    const idx = INSTANCES.findIndex((it) => it.guid === guid);
    if (idx < 0) {
      return HttpResponse.json({ message: `实例不存在：${guid}` }, { status: 404 });
    }
    if (INSTANCES[idx].claimedBy) {
      return HttpResponse.json({ message: `已被认领：${INSTANCES[idx].claimedBy}` }, { status: 409 });
    }
    INSTANCES[idx] = { ...INSTANCES[idx], claimedBy: MOCK_CURRENT_USER };
    return HttpResponse.json({ data: INSTANCES[idx], success: true });
  }),

  // 血缘图（#15）：返回表级血缘 DAG，影响分析在前端按 focus 节点计算下游。
  http.get('*/api/meta/lineage', () => {
    return HttpResponse.json({ data: LINEAGE_GRAPH, success: true });
  }),

  // 采集数据源（#14）。
  http.get('*/api/meta/collect/sources', () => {
    return HttpResponse.json({ data: COLLECT_SOURCES, success: true });
  }),

  // 扫描运行列表（#14）：含变更集 + 异动（按时间倒序）。
  http.get('*/api/meta/collect/runs', () => {
    return HttpResponse.json({ data: SCAN_RUNS, success: true });
  }),

  // 触发结构扫描（#14）：生成一次运行；数据源不存在→404，连接异常→409。
  http.post('*/api/meta/collect/sources/:id/scan', ({ params }) => {
    const id = String(params.id);
    const source = COLLECT_SOURCES.find((s) => s.id === id);
    if (!source) {
      return HttpResponse.json({ message: `数据源不存在：${id}` }, { status: 404 });
    }
    if (source.status === 'ERROR') {
      return HttpResponse.json({ message: '数据源连接异常，无法扫描' }, { status: 409 });
    }
    return HttpResponse.json({ data: runScan(source), success: true }, { status: 201 });
  }),

  // 元数据变更事件流（#16）：服务端分页 + type 过滤（只读观测）。
  http.get('*/api/meta/events', ({ request }) => {
    const url = new URL(request.url);
    const current = Number(url.searchParams.get('current') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const type = (url.searchParams.get('type') ?? '').trim();

    const filtered = type ? CHANGE_EVENTS.filter((e) => e.type === type) : CHANGE_EVENTS;
    const start = (current - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json({ data, total: filtered.length, success: true });
  }),
];
