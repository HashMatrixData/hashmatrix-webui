import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataSourceDetailDrawer } from './DataSourceDetailDrawer';

const DS = { id: 'ds_001', name: 'acme_mysql_demo_1', db: 'acme_app_1' };
const TABLES_API = '*/api/datasources/:id/tables';
const PREVIEW_API = '*/api/datasources/:id/preview';

// 每个 story 一个全新 QueryClient（retry/gcTime=0）——preview 未装配 QueryClientProvider；
// 全新 client 避免跨 story 缓存串味（呼应 TenantSwitcher.stories 的纪律）。
function QueryDecorator({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const meta: Meta<typeof DataSourceDetailDrawer> = {
  title: 'Pages/Integration/DataSourceDetailDrawer (库表预览)',
  component: DataSourceDetailDrawer,
  args: { open: true, dataSource: DS, onClose: () => {} },
  decorators: [(Story) => <QueryDecorator><Story /></QueryDecorator>],
};
export default meta;

type Story = StoryObj<typeof DataSourceDetailDrawer>;

/** 默认：库表树渲染 demo 表 → 选表 → 预览前 N 行真实数据（抽屉 portal 到 document.body）。 */
export const Default: Story = {
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText('orders_demo')).toBeInTheDocument();
    await userEvent.click(await body.findByText('orders_demo'));
    await waitFor(async () => {
      await expect(await body.findByText('orders_demo_row_1')).toBeInTheDocument();
    });
  },
};

/** 库表加载失败：msw `/tables` 返 500 → 内联错误 Alert。 */
export const TablesError: Story = {
  parameters: {
    msw: { handlers: [http.get(TABLES_API, () => HttpResponse.json({ message: 'err' }, { status: 500 }))] },
  },
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText(/库表加载失败/)).toBeInTheDocument();
  },
};

/** 预览加载失败：库表正常、msw `/preview` 返 500 → 选表后内联错误 Alert。 */
export const PreviewError: Story = {
  parameters: {
    msw: { handlers: [http.post(PREVIEW_API, () => HttpResponse.json({ message: 'err' }, { status: 500 }))] },
  },
  play: async () => {
    const body = within(document.body);
    await userEvent.click(await body.findByText('orders_demo'));
    await expect(await body.findByText(/预览加载失败/)).toBeInTheDocument();
  },
};

/** 空库表：msw `/tables` 返空 → 左侧库表面板 Empty 占位（断言其专属文案，避开右侧预览占位 Empty 的歧义）。 */
export const EmptyTables: Story = {
  parameters: { msw: { handlers: [http.get(TABLES_API, () => HttpResponse.json([]))] } },
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText('无库表')).toBeInTheDocument();
    expect(body.queryByText('orders_demo')).toBeNull();
  },
};
