import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { LineageAnalysisPage } from './LineageAnalysisPage';

const meta: Meta<typeof LineageAnalysisPage> = {
  title: 'Pages/LineageAnalysisPage (msw)',
  component: LineageAnalysisPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof LineageAnalysisPage>;

/**
 * 血缘分析（E2E）：默认焦点 dwd.order_fact，影响清单列出其下游受影响资产。
 * 注：G6 渲染到 canvas，无法断言图内文本，故断言 DOM 侧的影响清单。
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    // 默认焦点 dwd.order_fact：下游影响清单出现末端资产 ads.dashboard。
    await waitFor(async () => {
      await expect(await canvas.findByText('ads.dashboard')).toBeInTheDocument();
    });
    await expect(canvasElement.querySelector('[data-testid="lineage-impact-graph"]')).not.toBeNull();

    // 切换焦点到叶子节点 ads.dashboard → 影响集重算为空。
    await userEvent.click(canvas.getByRole('combobox'));
    const option = await body.findByText('ads.dashboard', {
      selector: '.ant-select-item-option-content',
    });
    await userEvent.click(option);
    await waitFor(async () => {
      await expect(await canvas.findByText('无下游影响')).toBeInTheDocument();
    });
  },
};
