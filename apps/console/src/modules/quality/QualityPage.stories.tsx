import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { QualityPage } from './QualityPage';
import { emptyList, errorList, slowList } from '@/mocks/testHandlers';

const RULES_API = '*/api/quality-rules';

const meta: Meta<typeof QualityPage> = {
  title: 'Pages/Quality (msw)',
  component: QualityPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof QualityPage>;

/** 默认（正常态）：KPI 统计卡 + 规则执行 ProTable，数据经 axios → msw 自含。play 断言首行规则渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('completeness_check_1')).toBeInTheDocument();
    });
  },
};

/** 空态：msw 返回空页 → ProTable 显示「暂无数据」；KPI 卡为静态派生仍在（与表格取数解耦）。 */
export const Empty: Story = {
  parameters: { msw: { handlers: [emptyList(RULES_API)] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvasElement.querySelector('.ant-empty')).not.toBeNull();
    });
    expect(canvas.queryByText('completeness_check_1')).toBeNull();
  },
};

/** 错误态：msw 返回 500 → 降级空表 + 内联错误 Alert（role=alert，与空态可区分）。 */
export const LoadError: Story = {
  parameters: { msw: { handlers: [errorList(RULES_API)] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText(/数据加载失败/)).toBeInTheDocument();
    });
    expect(canvas.queryByText('completeness_check_1')).toBeNull();
  },
};

/** 加载态：msw 延迟 1.5s（有限延迟，不卡 test-runner 的 networkidle）→ 断言加载指示存在。 */
export const Loading: Story = {
  parameters: { msw: { handlers: [slowList(RULES_API)] } },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      expect(canvasElement.querySelector('.ant-spin-spinning, .ant-skeleton')).not.toBeNull();
    });
  },
};
