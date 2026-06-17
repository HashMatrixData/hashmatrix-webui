import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScaleContainer } from './ScaleContainer';
import { TrendChart } from './TrendChart';

const meta: Meta = {
  title: 'Canvas/Big Screen (G2)',
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

/** 大屏 scale 容器内的 G2 趋势图（DoD #6）：等比自适应，系列色随品牌。 */
export const ScaledDashboard: Story = {
  render: () => (
    <div style={{ height: 480 }}>
      <ScaleContainer baseWidth={1280} baseHeight={720}>
        <div style={{ width: 1280, height: 720, padding: 48, boxSizing: 'border-box' }}>
          <TrendChart />
        </div>
      </ScaleContainer>
    </div>
  ),
};
