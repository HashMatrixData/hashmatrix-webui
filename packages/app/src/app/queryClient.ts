import { QueryClient } from '@tanstack/react-query';

/** 服务端状态客户端（TanStack Query）。 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
});
