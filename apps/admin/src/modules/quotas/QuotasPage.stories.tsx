import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { QuotasPage } from './QuotasPage';

const meta: Meta<typeof QuotasPage> = {
  title: 'Admin/Quotas',
  component: QuotasPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof QuotasPage>;

/** 配额查看与调整。数据经 control-plane msw 自含。play 断言首行 mock 租户与「调整配额」入口渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('tenant-acme')).toBeInTheDocument();
    });
    // 每行一个调整入口（mock 3 行配额），按钮可达即满足查改门径。
    const adjustButtons = await canvas.findAllByRole('button', { name: '调整配额' });
    await expect(adjustButtons.length).toBeGreaterThan(0);
  },
};
