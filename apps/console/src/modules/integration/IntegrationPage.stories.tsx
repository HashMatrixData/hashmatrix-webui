import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { IntegrationPage } from './IntegrationPage';

const meta: Meta<typeof IntegrationPage> = {
  title: 'Pages/Integration (数据集成)',
  component: IntegrationPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof IntegrationPage>;

/** 数据集成入口页：ProTable 渲染脱敏 demo 任务。play 即 E2E 夹具：断言首行任务名渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('sync_acme_dwd_1')).toBeInTheDocument();
    });
  },
};
