import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { ProvisioningPage } from './ProvisioningPage';

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
