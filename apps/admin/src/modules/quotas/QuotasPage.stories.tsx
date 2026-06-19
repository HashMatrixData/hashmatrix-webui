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
