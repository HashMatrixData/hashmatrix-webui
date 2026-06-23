import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { WarehouseLayerPage } from './WarehouseLayerPage';
import { errorList, slowList } from '@/mocks/testHandlers';

const LAYERS_API = '*/api/dw-layers';

const meta: Meta<typeof WarehouseLayerPage> = {
  title: 'Pages/DataArchitecture/WarehouseLayer (msw)',
  component: WarehouseLayerPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof WarehouseLayerPage>;

/** 默认态：五层卡片（含 KPI 漏斗），数据经 axios → msw 自含。play 断言 ODS 层卡片渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('操作数据层')).toBeInTheDocument();
    });
  },
};

/**
 * 错误态：msw 返回 500 → 内联错误 Alert（role=alert）；卡片不渲染。
 * 注：五层为预置固定集，无业务「空态」语义，故不设 Empty story。
 */
export const LoadError: Story = {
  parameters: { msw: { handlers: [errorList(LAYERS_API)] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText(/数据加载失败/)).toBeInTheDocument();
    });
    expect(canvas.queryByText('操作数据层')).toBeNull();
  },
};

/** 加载态：msw 延迟 1.5s（有限延迟，不卡 networkidle）→ 断言加载指示存在。 */
export const Loading: Story = {
  parameters: { msw: { handlers: [slowList(LAYERS_API)] } },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      expect(canvasElement.querySelector('.ant-spin')).not.toBeNull();
    });
  },
};
