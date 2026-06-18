import { describe, it, expect } from 'vitest';
import { resolveBrand, DEFAULT_BRAND, applyPresetToBrand, BRAND_PRESETS } from '@hashmatrix/brand';
import { hasAnyRole, ROLES } from '@hashmatrix/sdk';

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
