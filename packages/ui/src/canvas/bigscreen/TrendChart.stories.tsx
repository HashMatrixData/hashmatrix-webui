import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrendChart } from './TrendChart';

const meta: Meta = {
  title: 'Canvas/Trend Chart (G2)',
};
export default meta;

type Story = StoryObj;

/** G2 趋势图：系列色随品牌；autoFit，需显式定高祖先容器方能渲染。 */
export const Default: Story = {
  render: () => (
    <div style={{ height: 480 }}>
      <TrendChart />
    </div>
  ),
};
