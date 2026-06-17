import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppAuthProvider } from '@/auth';
import { AppConfigProvider } from '@/theme';
import { queryClient } from './queryClient';

/**
 * 全局 Provider 装配：
 * Query（服务端状态）→ Auth（会话/登录壳）→ ConfigProvider（AntD token/locale/主题 + 白标）。
 * i18n 在入口副作用初始化（见 main.tsx）。
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppAuthProvider>
        <AppConfigProvider>{children}</AppConfigProvider>
      </AppAuthProvider>
    </QueryClientProvider>
  );
}
