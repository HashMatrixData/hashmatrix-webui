import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { TenantDirectoryPage } from './TenantDirectoryPage';

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
      await expect(await canvas.findByText('tenant-acme')).toBeInTheDocument();
    });
  },
};
