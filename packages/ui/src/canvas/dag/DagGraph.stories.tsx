import type { Meta, StoryObj } from '@storybook/react-vite';
import { DagGraph } from './DagGraph';

const meta: Meta<typeof DagGraph> = {
  title: 'Canvas/DAG (X6)',
  component: DagGraph,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof DagGraph>;

/** DAG 编排（X6）：选中任务强调色随品牌，状态色固定。 */
export const Default: Story = {
  args: { height: 400 },
};
