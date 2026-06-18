import { describe, it, expect, beforeAll } from 'vitest';
import i18n from '@/i18n';

describe('admin i18n', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('zh-CN');
  });

  it('叠加了 admin 自有命名空间（menu/tenant）于共享基线之上', () => {
    expect(i18n.t('menu.tenants')).toBe('租户目录');
    expect(i18n.t('tenant.title')).toBe('租户目录');
  });

  it('继承共享基线命名空间（language/theme/auth）', () => {
    expect(i18n.t('language.label')).toBe('语言');
    expect(i18n.t('theme.dark')).toBe('深色');
    expect(i18n.t('auth.signOut')).toBe('退出登录');
  });

  it('en-US 与 zh-CN key 平价（无中文泄漏到英文）', async () => {
    await i18n.changeLanguage('en-US');
    expect(i18n.t('menu.tenants')).toBe('Tenants');
    expect(i18n.t('auth.signOut')).toBe('Sign out');
    await i18n.changeLanguage('zh-CN');
  });
});
