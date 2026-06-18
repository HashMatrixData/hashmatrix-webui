/* eslint-disable react-refresh/only-export-components -- Storybook 预览配置：默认导出 preview 配置而非组件 */
import { useEffect, type ReactNode } from 'react';
import type { Preview } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { initialize, mswLoader } from 'msw-storybook-addon';
import '@/index.css';
import i18n from '@/i18n';
import { bootstrapBrand } from '@hashmatrix/brand';
import { configureMockSession, MockSessionProvider, ROLES } from '@hashmatrix/sdk';
import { useThemeStore, AppConfigProvider, type ThemeMode } from '@hashmatrix/theme';
import { handlers } from '@/mocks/handlers';
import { queryClient } from '@/app/queryClient';

initialize({ onUnhandledRequest: 'bypass' }, handlers);
bootstrapBrand();
// admin 故事以 superadmin 身份渲染。
configureMockSession({ name: 'Ops Admin', email: 'ops.admin@example.com', roles: [ROLES.SUPERADMIN] });

function StoryProviders({ theme, locale, children }: { theme: ThemeMode; locale: string; children: ReactNode }) {
  const setMode = useThemeStore((s) => s.setMode);
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
  parameters: { controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } } },
  loaders: [mswLoader],
  initialGlobals: { theme: 'light', locale: 'zh-CN' },
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
