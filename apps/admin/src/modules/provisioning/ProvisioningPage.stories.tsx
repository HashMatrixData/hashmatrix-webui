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

/** 开通状态：provision 进度 / 结果。数据经 control-plane msw 自含。play 断言已完成作业（mock）与结果标签渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('tenant-stark')).toBeInTheDocument();
    });
    // 三态结果标签均应出现（running/succeeded/failed 各有 mock 作业）。
    await expect(await canvas.findByText('成功')).toBeInTheDocument();
    await expect(await canvas.findByText('失败')).toBeInTheDocument();
  },
};
