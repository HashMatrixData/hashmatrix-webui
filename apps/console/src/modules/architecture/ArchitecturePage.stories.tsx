import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ArchitecturePage } from './ArchitecturePage';

const meta: Meta<typeof ArchitecturePage> = {
  title: 'Pages/Architecture (数据架构)',
  component: ArchitecturePage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof ArchitecturePage>;

/** 数据架构入口页：复用 G6 血缘画布。play 即 E2E 夹具：断言画布容器挂载。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByTestId('lineage-graph')).toBeInTheDocument();
  },
};
