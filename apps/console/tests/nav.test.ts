import { describe, it, expect } from 'vitest';
import { NAV_ITEMS, NAV_LEAVES, DEFAULT_ROUTE, type NavItem } from '@/routes/navConfig';
import zhCN from '@/i18n/locales/zh-CN';
import enUS from '@/i18n/locales/en-US';

/** 收集树中全部 labelKey（L1 + L2）。 */
function allLabelKeys(items: NavItem[], acc: string[] = []): string[] {
  for (const item of items) {
    acc.push(item.labelKey);
    if (item.children) allLabelKeys(item.children, acc);
  }
  return acc;
}

describe('canonical 导航骨架 (WP2)', () => {
  it('L1 恰为 11 个（含独立「组织管理」）', () => {
    expect(NAV_ITEMS).toHaveLength(11);
  });

  it('「组织管理」是独立 L1（非折叠进管理中心），下挂 3 个 L2', () => {
    const org = NAV_ITEMS.find((i) => i.path === '/org-admin');
    expect(org, '组织管理应为独立 L1').toBeDefined();
    expect(org!.labelKey).toBe('menu.orgAdmin');
    expect(org!.children).toHaveLength(3);
    // 管理中心不得吞并组织管理的成员/角色/用户组
    const mc = NAV_ITEMS.find((i) => i.path === '/management-center');
    expect(mc!.children!.some((c) => c.path.startsWith('/settings/users'))).toBe(false);
  });

  it('概览是 L1 叶子，落地路由为 /，且为默认路由', () => {
    const overview = NAV_ITEMS[0];
    expect(overview.path).toBe('/');
    expect(overview.labelKey).toBe('menu.overview');
    expect(overview.children).toBeUndefined();
    expect(DEFAULT_ROUTE).toBe('/');
  });

  it('每个非概览 L1 都带图标且至少 1 个 L2', () => {
    for (const l1 of NAV_ITEMS) {
      expect(l1.icon, `${l1.labelKey} 应带图标`).toBeTruthy();
      if (l1.path !== '/') {
        expect(l1.children?.length, `${l1.labelKey} 应有 L2`).toBeGreaterThan(0);
      }
    }
  });

  it('叶子路径唯一、无重复路由（零断链的前提）', () => {
    const paths = NAV_LEAVES.map((l) => l.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('NAV_LEAVES 覆盖全部可达叶子（概览 + 33 个 L2 = 34）', () => {
    expect(NAV_LEAVES).toHaveLength(34);
  });

  it('叶子路径可派生为合法相对路由（router 由同一组叶子派生，故零断链）', () => {
    // router.tsx 以 `path.replace(/^\//,'')` 把每个叶子（概览除外）派生为相对子路由。
    // 此处校验该派生的前提成立：非概览叶子的相对路径非空且唯一。
    const relative = NAV_LEAVES.filter((l) => l.path !== '/').map((l) => l.path.replace(/^\//, ''));
    expect(relative).toHaveLength(33);
    for (const p of relative) expect(p, '叶子相对路径不应为空').not.toBe('');
    expect(new Set(relative).size, '相对路由路径应唯一').toBe(relative.length);
  });
});

describe('导航 i18n（双语解析无漏 key）', () => {
  it('每个 labelKey 形如 menu.* 且在中/英文均可解析', () => {
    for (const key of allLabelKeys(NAV_ITEMS)) {
      expect(key.startsWith('menu.'), `${key} 应在 menu 命名空间`).toBe(true);
      const sub = key.slice('menu.'.length) as keyof typeof zhCN.menu;
      expect(zhCN.menu[sub], `zh-CN 缺 ${key}`).toBeTruthy();
      expect(enUS.menu[sub], `en-US 缺 ${key}`).toBeTruthy();
    }
  });

  it('menu 命名空间中英 key 集合一致（无单语漏译）', () => {
    expect(Object.keys(enUS.menu).sort()).toEqual(Object.keys(zhCN.menu).sort());
  });

  it('占位页文案双语齐备', () => {
    expect(zhCN.placeholder.comingSoon).toBeTruthy();
    expect(enUS.placeholder.comingSoon).toBeTruthy();
  });
});
