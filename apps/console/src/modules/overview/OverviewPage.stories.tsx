import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { OverviewPage } from './OverviewPage';

const meta: Meta<typeof OverviewPage> = {
  title: 'Pages/Overview (msw)',
  component: OverviewPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof OverviewPage>;

/** 租户概览着陆页：KPI 统计卡 + 大屏趋势图。play 断言 KPI 标题渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('数据集')).toBeInTheDocument();
    });
  },
};
