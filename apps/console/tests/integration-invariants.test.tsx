import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { isValidElement, type ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { Navigate } from 'react-router-dom';

// 导入真实 router 会经 AppLayout 拉入 @hashmatrix/ui 桶（含 AntV X6/G6/G2 画布），其 CJS↔ESM
// 在 vitest 下崩溃。本文件只读 router.routes 校验路由表，从不渲染 AppLayout，故桩掉桶里的控件，
// 既断开 AntV 链、又保留对真实路由接线（#1/#2）的跨刀校验。零生产改动。
vi.mock('@hashmatrix/ui', () => ({
  LanguageSwitch: () => null,
  ThemeSwitch: () => null,
  BrandSwitch: () => null,
  RoleSwitcher: () => null,
}));
import {
  RequireRole,
  ROLES,
  http,
  setTenantProvider,
  getCurrentTenant,
} from '@hashmatrix/sdk';
import { DEFAULT_BRAND, resolveBrand } from '@hashmatrix/brand';
import i18n from '@/i18n';
import { router } from '@/app/router';
import { NAV_ITEMS, NAV_LEAVES, DEFAULT_ROUTE, type NavItem } from '@/routes/navConfig';
import { ModulePlaceholder } from '@/components/ModulePlaceholder';
import zhCN from '@/i18n/locales/zh-CN';
import enUS from '@/i18n/locales/en-US';

/**
 * #16 · 末端集成回归守护（纯测试 · 零生产改动）。
 *
 * 守护本轮拆分中**没有任何单刀能独立守护的跨边界不变量**——它们横跨多个 PR（#8–#15），
 * 各刀只看到自己那半，唯有在末端汇聚处校验「两半仍咬合」。本文件专补这些**跨刀缝隙**，
 * 不重复各刀自有的单元覆盖。五类不变量的归属：
 *  ① nav↔route↔page 完整性（跨 #9 + #11/#12/#13/#14）—— 本文件（结构）；各真页「渲染不报错」由
 *     Storybook+Playwright 门覆盖（12 真页均有 *.stories.tsx），占位页渲染在此补 smoke。
 *  ② RBAC 路由级门控（跨 #14）—— 本文件（navConfig 声明 roles ⇒ router 必以 RequireRole 兜底）；
 *     菜单级隐藏见 nav.test.ts（filterNavByRole），403 行为见 MembersPage.stories（Forbidden）。
 *  ③ i18n 完整性（跨 #9 + 各页面刀）—— 本文件（zh-CN⟺en-US 全命名空间 key 对齐，超出 menu.*）。
 *  ④ 品牌 D4/D3（跨 #8）—— 详尽用例见 brand.test.ts；本文件留锚点确保五类齐备可一处复核。
 *  ⑤ 多租户 D2（跨 #10 + #15）—— 本文件（切换会话租户 ⇒ X-Tenant-Id 随之改变）；派生/无租户兜底
 *     见 tenant.test.ts。
 */

// router 顶层为 <RequireAuth><AppLayout/>；其 children 即全部业务路由（index/叶子/L1 重定向/demo/兜底）。
// 仅依赖 path/index/element 三字段，避免耦合 react-router 内部规范化类型。
const layoutChildren = (router.routes[0]?.children ?? []) as Array<{
  path?: string;
  index?: boolean;
  element?: unknown;
}>;

const rel = (navPath: string) => navPath.replace(/^\//, '');
const byPath = (p: string) => layoutChildren.find((r) => r.path === p);
const elementOf = (entry?: { element?: unknown }): ReactElement | undefined =>
  entry && isValidElement(entry.element) ? (entry.element as ReactElement) : undefined;

// i18n 是 @hashmatrix/i18n 共享单例：本文件多处 changeLanguage 改写其语言态，必须在文件末还原，
// 否则后续测试（尤其断言英文文案者）会因停留在 zh-CN 而顺序耦合假绿/假红——与本文件对
// http.defaults.adapter 的还原纪律保持一致（共享单例必还原）。
let originalLang: string;
beforeAll(() => {
  originalLang = i18n.language || 'zh-CN';
});
afterAll(async () => {
  await i18n.changeLanguage(originalLang);
});

describe('① nav↔route↔page 完整性（跨 #9 导航骨架 + #11/#12/#13/#14 各页面刀）', () => {
  const routePaths = layoutChildren
    .filter((r) => typeof r.path === 'string' && r.path !== '*')
    .map((r) => r.path as string);

  it('每个导航叶子（概览除外）都有对应路由——零断链', () => {
    for (const leaf of NAV_LEAVES.filter((l) => l.path !== '/')) {
      expect(routePaths, `叶子 ${leaf.path} 无对应路由（断链）`).toContain(rel(leaf.path));
    }
  });

  it('路由路径唯一——无路由碰撞', () => {
    expect(new Set(routePaths).size).toBe(routePaths.length);
  });

  it('概览为 index 路由且有元素；通配符兜底回默认路由', () => {
    const index = layoutChildren.find((r) => r.index === true);
    expect(index, '应有 index 路由（概览）').toBeDefined();
    expect(isValidElement(index!.element)).toBe(true);

    const fallback = elementOf(byPath('*'));
    expect(fallback?.type, '* 应为 Navigate 兜底').toBe(Navigate);
    expect((fallback!.props as { to: string }).to).toBe(DEFAULT_ROUTE);
  });

  it('每个含子项的 L1 都有重定向路由，目标=其首个叶子（L1 URL 不 404）', () => {
    for (const l1 of NAV_ITEMS.filter((i) => i.children && i.children.length > 0)) {
      const el = elementOf(byPath(rel(l1.path)));
      expect(el?.type, `${l1.path} 应有重定向路由`).toBe(Navigate);
      let node: NavItem = l1;
      while (node.children && node.children.length > 0) node = node.children[0];
      expect((el!.props as { to: string }).to, `${l1.path} 应重定向至首叶`).toBe(node.path);
    }
  });

  it('占位组件渲染 smoke：显示标题与建设中文案（各占位叶子复用同一组件、仅 titleKey 不同）', async () => {
    // 仅占位组件渲染本身的 smoke（一次足矣，渲染逻辑与 titleKey 无关）；各占位叶子 titleKey 能否
    // 解析由 ③ 的全 labelKey 解析用例守护，二者叠加才闭环「占位叶子可达且不漏 key」。
    await i18n.changeLanguage('zh-CN');
    render(<ModulePlaceholder titleKey="menu.datasource" />);
    expect(screen.getByText('数据源管理')).toBeInTheDocument();
    expect(screen.getByText('功能建设中，敬请期待')).toBeInTheDocument();
  });
});

describe('② RBAC 路由级门控（跨 #14：navConfig 声明 roles ⇒ router 以 RequireRole 兜底）', () => {
  const guardOf = (navPath: string) => {
    const el = elementOf(byPath(rel(navPath)));
    const guarded = el?.type === RequireRole;
    return { guarded, roles: guarded ? (el!.props as { roles: readonly string[] }).roles : undefined };
  };

  it('组织管理三叶均被 RequireRole 以 admin 兜底（路由级守卫）', () => {
    for (const path of ['/settings/users', '/settings/roles', '/settings/user-groups']) {
      const { guarded, roles } = guardOf(path);
      expect(guarded, `${path} 应被路由级守卫`).toBe(true);
      expect(roles).toContain(ROLES.ADMIN);
    }
  });

  it('受守卫的 canonical 叶子集 ⟺ navConfig 中带 roles 的叶子集（守卫不多不漏）', () => {
    const declared = NAV_LEAVES.filter((l) => l.path !== '/' && l.roles?.length).map((l) => l.path).sort();
    const guarded = NAV_LEAVES.filter((l) => l.path !== '/' && guardOf(l.path).guarded).map((l) => l.path).sort();
    expect(guarded).toEqual(declared);
  });

  it('未声明 roles 的叶子不被过度门控（如数据地图 /catalog/map）', () => {
    expect(guardOf('/catalog/map').guarded).toBe(false);
  });

  it('数据治理演示路由受 governance:editor / admin 路由级守卫（#14 原语应用于治理页）', () => {
    const el = elementOf(byPath('governance'));
    expect(el?.type, 'governance 应被 RequireRole 包裹').toBe(RequireRole);
    const roles = (el!.props as { roles: readonly string[] }).roles;
    expect(roles).toContain(ROLES.GOVERNANCE_EDITOR);
    expect(roles).toContain(ROLES.ADMIN);
  });
});

describe('③ i18n 完整性（zh-CN ⟺ en-US 全命名空间 key 对齐，跨 #9 + 各页面刀）', () => {
  // 递归收集 [点路径, 值]：覆盖 console 自有的全部命名空间（menu / 各页面），非仅 menu.*。
  const flatten = (
    obj: Record<string, unknown>,
    prefix = '',
    acc: Array<[string, unknown]> = [],
  ): Array<[string, unknown]> => {
    for (const [k, v] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${k}` : k;
      if (v !== null && typeof v === 'object') flatten(v as Record<string, unknown>, path, acc);
      else acc.push([path, v]);
    }
    return acc;
  };
  const zhFlat = flatten(zhCN as unknown as Record<string, unknown>);
  const enFlat = flatten(enUS as unknown as Record<string, unknown>);

  it('zh-CN 与 en-US 叶子 key 集合完全一致（无单语漏译 / 无多余 key）', () => {
    expect(enFlat.map(([k]) => k).sort()).toEqual(zhFlat.map(([k]) => k).sort());
  });

  it('两语言所有叶子值均为非空字符串（无占位 raw key / 空串）', () => {
    for (const [label, flat] of [['zh-CN', zhFlat], ['en-US', enFlat]] as const) {
      for (const [path, value] of flat) {
        expect(
          typeof value === 'string' && value.length > 0,
          `${label} 的 ${path} 应为非空字符串`,
        ).toBe(true);
      }
    }
  });

  // 经**真实 i18n 实例**校验解析（i18n.exists/t）：守护资源确已挂载进运行期实例的正确命名空间——
  // 区别于 nav.test.ts 直接读资源**对象**（zhCN.menu[k]）的存在性检查；二者一为接线、一为字面，互补不重复。
  it('每个导航 labelKey（L1 + L2）经 i18n 实例可解析，不回落 raw key', async () => {
    await i18n.changeLanguage('zh-CN');
    const keys = [...NAV_ITEMS.map((i) => i.labelKey), ...NAV_LEAVES.map((l) => l.labelKey)];
    for (const key of keys) {
      expect(i18n.exists(key), `${key} 未解析`).toBe(true);
      expect(i18n.t(key), `${key} 回落 raw key`).not.toBe(key);
    }
  });
});

describe('④ 品牌 D4/D3 锚点（跨 #8 · 详尽用例见 brand.test.ts）', () => {
  it('构建期默认品牌为 emerald（D4）', () => {
    expect(DEFAULT_BRAND.colorPrimary).toBe('#059669');
  });

  it('运行期 config.js 可任意覆盖主色而不破坏白标解析（D3 部署级注入）', () => {
    expect(resolveBrand({ brand: { colorPrimary: '#ff00ff' } }).colorPrimary).toBe('#ff00ff');
  });
});

describe('⑤ 多租户 D2 · 会话单一来源 + 切换改变之（跨 #10 派生 + #15 切换）', () => {
  // 桩 adapter 回显经拦截器处理后的 config，免真实网络。http 是 @hashmatrix/sdk 共享单例，
  // afterAll 必须还原 adapter，杜绝跨文件泄漏（否则其他文件取数组件假绿）。
  type Adapter = NonNullable<typeof http.defaults.adapter>;
  let realAdapter: Adapter | undefined;
  beforeAll(() => {
    realAdapter = http.defaults.adapter;
    http.defaults.adapter = (async (config: unknown) => ({
      data: null,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    })) as unknown as Adapter;
  });
  afterAll(() => {
    http.defaults.adapter = realAdapter;
  });
  afterEach(() => {
    setTenantProvider(() => undefined);
  });

  // 取请求上（忽略大小写）X-Tenant-Id 的全部取值。AxiosHeaders 按名归一、set 覆盖 ⇒ 同名头结构性
  // 唯一，故本数组恒为 0 或 1 个元素：以 `toEqual([值])` 一次性断言「头确已附（非 0）+ 值=当前会话租户
  // + 无陈旧残留值」。注意：它**不**校验"重复同名头"（该场景在 AxiosHeaders 下不可能发生，与 get() 同）。
  // 无租户=不发头（数组为空）由 tenant.test.ts 守护。
  const tenantHits = async (): Promise<string[]> => {
    const res = await http.get('/ping');
    const headers = res.config.headers as {
      toJSON?: () => Record<string, unknown>;
      get: (k: string) => unknown;
    };
    const json = headers.toJSON?.() ?? {};
    return Object.entries(json)
      .filter(([k]) => k.toLowerCase() === 'x-tenant-id')
      .map(([, v]) => String(v));
  };

  it('切换会话租户 ⇒ 下一请求 X-Tenant-Id 随之改变；每请求附该头且值=会话租户（D2）', async () => {
    setTenantProvider(() => 'acme');
    expect(getCurrentTenant()).toBe('acme');
    expect(await tenantHits()).toEqual(['acme']); // 切换前基线（与 tenant.test.ts 单点覆盖有意重叠，作切换对照锚）

    setTenantProvider(() => 'globex'); // 模拟 #15 切租户＝换 token＝换会话租户
    expect(getCurrentTenant()).toBe('globex');
    expect(await tenantHits()).toEqual(['globex']); // 切换后恰一个，值=globex，无 acme 残留
  });
});
