import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DevelopmentPage } from './DevelopmentPage';

const meta: Meta<typeof DevelopmentPage> = {
  title: 'Pages/Development (数据开发)',
  component: DevelopmentPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof DevelopmentPage>;

/** 数据开发入口页：复用 X6 DAG 画布。play 即 E2E 夹具：断言画布容器挂载。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByTestId('dag-graph')).toBeInTheDocument();
  },
};
