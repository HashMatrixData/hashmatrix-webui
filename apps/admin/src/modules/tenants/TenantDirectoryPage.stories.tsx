import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { TenantDirectoryPage } from './TenantDirectoryPage';
import { emptyList, errorList, slowList } from '@/mocks/testHandlers';

// 取数路径（命中 control-plane mock 列表端点）。per-story 覆盖全局 handler 造空/错/慢态。
const TENANTS_API = '*/control-plane/v1/tenants';

const meta: Meta<typeof TenantDirectoryPage> = {
  title: 'Admin/Tenant Directory',
  component: TenantDirectoryPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof TenantDirectoryPage>;

/** 租户目录（ProTable + 详情）。数据经 control-plane msw 自含。play 断言首行 mock 租户渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      // 断言显示名（唯一）——tenantId 与 orgAlias 在 M1 同值，会命中多列。
      await expect(await canvas.findByText('Acme Demo')).toBeInTheDocument();
    });
    // 软删除（deleted）租户仍列出——契约 v1.2.0 / C：保留可见审计历史。
    await expect(await canvas.findByText('Umbrella Demo')).toBeInTheDocument();
  },
};

/** 空态：msw 返回空页 → ProTable 显示「暂无数据」（.ant-empty），无业务行。 */
export const Empty: Story = {
  parameters: { msw: { handlers: [emptyList(TENANTS_API)] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvasElement.querySelector('.ant-empty')).not.toBeNull();
    });
    expect(canvas.queryByText('Acme Demo')).toBeNull();
  },
};

/** 错误态：msw 返回 500 → useTableRequest 降级空表 + 内联错误 Alert（role=alert，与空态可区分）。 */
export const LoadError: Story = {
  parameters: { msw: { handlers: [errorList(TENANTS_API)] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText(/数据加载失败/)).toBeInTheDocument();
    });
    expect(canvas.queryByText('Acme Demo')).toBeNull();
  },
};

/** 加载态：msw 延迟 1.5s（有限延迟，不卡 test-runner 的 networkidle）→ 断言加载指示存在。 */
export const Loading: Story = {
  parameters: { msw: { handlers: [slowList(TENANTS_API)] } },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      expect(canvasElement.querySelector('.ant-spin-spinning, .ant-skeleton')).not.toBeNull();
    });
  },
};
