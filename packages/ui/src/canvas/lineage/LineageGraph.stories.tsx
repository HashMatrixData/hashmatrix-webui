import type { Meta, StoryObj } from '@storybook/react-vite';
import { LineageGraph } from './LineageGraph';

const meta: Meta<typeof LineageGraph> = {
  title: 'Canvas/Lineage (G6)',
  component: LineageGraph,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof LineageGraph>;

/** 血缘图（G6）：聚焦节点强调色随品牌。切换工具栏 theme/换肤观察。 */
export const Default: Story = {
  args: { height: 400 },
};
