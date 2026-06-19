import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { QualityPage } from './QualityPage';

const meta: Meta<typeof QualityPage> = {
  title: 'Pages/Quality (msw)',
  component: QualityPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof QualityPage>;

/** 质量大盘：KPI 统计卡 + 规则执行 ProTable，数据经 axios → msw 自含。play 断言首行规则渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('completeness_check_1')).toBeInTheDocument();
    });
  },
};
