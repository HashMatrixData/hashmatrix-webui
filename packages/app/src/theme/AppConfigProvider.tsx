import { useMemo, type ReactNode } from 'react';
import { ConfigProvider, theme as antdTheme, App as AntdApp } from 'antd';
import { useTranslation } from 'react-i18next';
import { useBrandStore, composeFontFamily } from '@/brand';
import { getAntdLocale } from '@/i18n/antdLocale';
import { useThemeStore } from './store';

/**
 * 主题装配中枢——白标引擎四路分发的 React 渲染通道汇合点：
 * - 路 1：brand.colorPrimary → AntD token（全量组件换肤）
 * - 路 2：brand 主辅色 → CSS Vars（随 brand 变化重分发到 :root）
 * - i18n locale 随当前语言切换（日期/数字/组件文案本地化）
 * - 明暗算法切换（defaultAlgorithm / darkAlgorithm）
 */
export function AppConfigProvider({ children }: { children: ReactNode }) {
  const brand = useBrandStore((s) => s.brand);
  const mode = useThemeStore((s) => s.mode);
  const { i18n } = useTranslation();

  // 品牌 DOM 副作用（CSS Vars / favicon / title）统一由 brand store 的 action 分发，
  // 初始由 bootstrapBrand() 分发一次（见 main.tsx）——此处不重复写 DOM，避免双重分发。
  const locale = useMemo(() => getAntdLocale(i18n.language), [i18n.language]);

  const themeConfig = useMemo(
    () => ({
      algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: brand.colorPrimary,
        colorInfo: brand.colorPrimary,
        fontFamily: composeFontFamily(brand.fontFamily),
      },
    }),
    [mode, brand.colorPrimary, brand.fontFamily],
  );

  return (
    <ConfigProvider theme={themeConfig} locale={locale}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
