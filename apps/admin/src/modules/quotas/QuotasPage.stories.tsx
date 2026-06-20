import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { QuotasPage } from './QuotasPage';
import { emptyList, errorList } from '@/mocks/testHandlers';

// 取数路径（命中 control-plane mock 列表端点）。per-story 覆盖全局 handler 造空/错态。
const TENANTS_API = '*/control-plane/v1/tenants';

const meta: Meta<typeof QuotasPage> = {
  title: 'Admin/Quotas',
  component: QuotasPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof QuotasPage>;

/**
 * 配额查看（仅限额）。数据经 control-plane msw 自含。
 * 契约 v1.2.0 / B：M1 仅展示限额（无用量条、无在线调整入口）。play 断言首行 mock 租户与限额列渲染。
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('tenant-acme')).toBeInTheDocument();
    });
    // 限额列存在（用户数上限），证明渲染的是 QuotaSpec 限额而非用量条。
    await expect(await canvas.findByText('用户数上限')).toBeInTheDocument();
  },
};

/** 空态：msw 返回空页 → Table 显示空态（.ant-table-placeholder），无业务行。 */
export const Empty: Story = {
  parameters: { msw: { handlers: [emptyList(TENANTS_API)] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvasElement.querySelector('.ant-table-placeholder')).not.toBeNull();
    });
    expect(canvas.queryByText('tenant-acme')).toBeNull();
  },
};

/** 错误态：msw 返回 500 → useQuery isError → 页内错误 Alert（role=alert，与空态可区分）。 */
export const LoadError: Story = {
  parameters: { msw: { handlers: [errorList(TENANTS_API)] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText(/数据加载失败/)).toBeInTheDocument();
    });
    expect(canvas.queryByText('tenant-acme')).toBeNull();
  },
};
