import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { ProvisioningPage } from './ProvisioningPage';
import { emptyList, errorList } from '@/mocks/testHandlers';

// 取数路径（命中 control-plane mock 列表端点）。空/错时无 provisioning 态租户 → 不触发逐租户开通查询，
// 故仅覆盖租户列表 handler 即可。
const TENANTS_API = '*/control-plane/v1/tenants';

const meta: Meta<typeof ProvisioningPage> = {
  title: 'Admin/Provisioning',
  component: ProvisioningPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof ProvisioningPage>;

/**
 * 开通状态：按 {tenantId} 取单租户开通进度（整体 phase + 分步 steps）。数据经 control-plane msw 自含。
 * play 断言开通中租户与其整体阶段标签渲染（in_progress / failed）。
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('tenant-stark')).toBeInTheDocument();
    });
    // 两个 provisioning 租户的整体阶段：tenant-stark=进行中、tenant-vehement=失败。
    await expect(await canvas.findByText('进行中')).toBeInTheDocument();
    await expect(await canvas.findByText('失败')).toBeInTheDocument();
  },
};

/** 空态：msw 返回空页 → 无 provisioning 态租户 → Table 显示空态（.ant-table-placeholder），无业务行。 */
export const Empty: Story = {
  parameters: { msw: { handlers: [emptyList(TENANTS_API)] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvasElement.querySelector('.ant-table-placeholder')).not.toBeNull();
    });
    expect(canvas.queryByText('tenant-stark')).toBeNull();
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
    expect(canvas.queryByText('tenant-stark')).toBeNull();
  },
};
