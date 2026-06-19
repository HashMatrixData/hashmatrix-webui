import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  resolveBrand,
  DEFAULT_BRAND,
  applyPresetToBrand,
  BRAND_PRESETS,
  applyBrandCssVars,
  BRAND_CSS_VARS,
} from '@hashmatrix/brand';
import { hasAnyRole, ROLES } from '@hashmatrix/sdk';

describe('默认品牌色 (D4 emerald)', () => {
  it('构建期默认主辅色为 emerald', () => {
    expect(DEFAULT_BRAND.colorPrimary).toBe('#059669');
    expect(DEFAULT_BRAND.colorSecondary).toBe('#10b981');
  });

  it('运行期 config.js 注入仍可覆盖默认主色 (D3 不破坏)', () => {
    // 用与默认/任何预设都无关的第三色，凸显“运行期任意注入”语义。
    const resolved = resolveBrand({ brand: { colorPrimary: '#ff00ff' } });
    expect(resolved.colorPrimary).toBe('#ff00ff');
    expect(resolved.colorPrimary).not.toBe(DEFAULT_BRAND.colorPrimary);
    // 未覆盖的辅色仍回落 emerald 默认
    expect(resolved.colorSecondary).toBe('#10b981');
  });

  it('“默认”换肤预设与构建期默认品牌一致', () => {
    const preset = BRAND_PRESETS.find((p) => p.key === 'default')!;
    expect(preset.colorPrimary).toBe(DEFAULT_BRAND.colorPrimary);
    expect(preset.colorSecondary).toBe(DEFAULT_BRAND.colorSecondary);
  });

  it('CSS Vars 分发路写入 :root 的默认色为 emerald（四路同源）', () => {
    const root = document.createElement('div');
    applyBrandCssVars(DEFAULT_BRAND, root);
    expect(root.style.getPropertyValue(BRAND_CSS_VARS.primary)).toBe('#059669');
    expect(root.style.getPropertyValue(BRAND_CSS_VARS.secondary)).toBe('#10b981');
  });

  it('默认占位 logo/favicon 资产同源 emerald 主色、无旧蓝残留', () => {
    // 默认资产由 brand.default.json 指向 public/brand/*.svg；运行期由部署级 config.js +
    // 自托管资源覆盖（D3），此处仅守护构建期占位与单一品牌源同色。vitest 工作目录为本包根（apps/console）。
    for (const asset of ['favicon.svg', 'logo-light.svg', 'logo-dark.svg']) {
      const svg = readFileSync(resolve(process.cwd(), 'public/brand', asset), 'utf-8');
      expect(svg, asset).toContain(DEFAULT_BRAND.colorPrimary);
      expect(svg, asset).not.toContain('#1668dc');
    }
  });
});

describe('白标引擎 resolveBrand', () => {
  it('无运行期覆盖时回落构建期默认', () => {
    expect(resolveBrand({})).toEqual(DEFAULT_BRAND);
  });

  it('运行期 brand 覆盖到字段级，缺省槽位回落默认', () => {
    const resolved = resolveBrand({ brand: { appName: 'Acme', colorPrimary: '#722ed1' } });
    expect(resolved.appName).toBe('Acme');
    expect(resolved.colorPrimary).toBe('#722ed1');
    // 未覆盖字段保持默认
    expect(resolved.companyName).toBe(DEFAULT_BRAND.companyName);
    expect(resolved.logo.favicon).toBe(DEFAULT_BRAND.logo.favicon);
  });

  it('logo 槽位部分覆盖时浅合并', () => {
    const resolved = resolveBrand({ brand: { logo: { light: '/x.svg' } as never } });
    expect(resolved.logo.light).toBe('/x.svg');
    expect(resolved.logo.dark).toBe(DEFAULT_BRAND.logo.dark);
  });
});

describe('换肤预设', () => {
  it('仅覆盖主辅色，其余字段保持', () => {
    const violet = BRAND_PRESETS.find((p) => p.key === 'violet')!;
    const next = applyPresetToBrand(DEFAULT_BRAND, violet);
    expect(next.colorPrimary).toBe(violet.colorPrimary);
    expect(next.colorSecondary).toBe(violet.colorSecondary);
    expect(next.appName).toBe(DEFAULT_BRAND.appName);
  });
});

describe('RBAC hasAnyRole', () => {
  it('OR 语义命中', () => {
    expect(hasAnyRole([ROLES.VIEWER], [ROLES.ADMIN, ROLES.VIEWER])).toBe(true);
  });
  it('未命中返回 false', () => {
    expect(hasAnyRole([ROLES.VIEWER], [ROLES.ADMIN])).toBe(false);
  });
  it('空 required 视为公开', () => {
    expect(hasAnyRole([], [])).toBe(true);
  });
});
