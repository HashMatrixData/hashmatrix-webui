import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '@hashmatrix/i18n';
import { ThemeSwitch } from '@hashmatrix/ui/controls';
import { useThemeStore } from '@hashmatrix/theme';

describe('ThemeSwitch', () => {
  beforeEach(async () => {
    // 语言探测在 jsdom 下依赖 navigator，显式锁定以保证断言确定性。
    await i18n.changeLanguage('zh-CN');
    useThemeStore.getState().setMode('light');
  });

  it('渲染明暗两个选项并能切换主题 store', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitch />);

    const dark = await screen.findByText('深色');
    expect(screen.getByText('浅色')).toBeInTheDocument();

    await user.click(dark);
    expect(useThemeStore.getState().mode).toBe('dark');
  });
});
