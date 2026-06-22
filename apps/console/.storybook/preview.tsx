/* eslint-disable react-refresh/only-export-components -- Storybook 预览配置：默认导出 preview 配置而非组件 */
import { useEffect, useState, type ReactNode } from 'react';
import type { Preview } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initialize, mswLoader } from 'msw-storybook-addon';
import '@/index.css';
import i18n from '@/i18n';
import { bootstrapBrand } from '@hashmatrix/brand';
import { useThemeStore, AppConfigProvider, type ThemeMode } from '@hashmatrix/theme';
import { MockSessionProvider } from '@hashmatrix/sdk';
import { handlers } from '@/mocks/handlers';

// msw：story 自含 mock 数据（worker 文件由 public/mockServiceWorker.js 提供）。
initialize({ onUnhandledRequest: 'bypass' }, handlers);
bootstrapBrand();

function StoryProviders({
  theme,
  locale,
  children,
}: {
  theme: ThemeMode;
  locale: string;
  children: ReactNode;
}) {
  const setMode = useThemeStore((s) => s.setMode);
  // 每个 story 挂载一个独立 QueryClient，避免 story 间服务端状态缓存串扰。
  const [queryClient] = useState(() => new QueryClient());
  useEffect(() => {
    setMode(theme);
  }, [theme, setMode]);
  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <MockSessionProvider>
          <AppConfigProvider>
            <div style={{ padding: 16 }}>{children}</div>
          </AppConfigProvider>
        </MockSessionProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  loaders: [mswLoader],
  initialGlobals: {
    theme: 'light',
    locale: 'zh-CN',
  },
  globalTypes: {
    theme: {
      description: '明暗主题',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: '语言',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'zh-CN', title: '简体中文' },
          { value: 'en-US', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <StoryProviders theme={context.globals.theme as ThemeMode} locale={context.globals.locale as string}>
        <Story />
      </StoryProviders>
    ),
  ],
};

export default preview;
