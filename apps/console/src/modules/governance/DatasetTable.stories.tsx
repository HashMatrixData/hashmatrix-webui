import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { DatasetTable } from './DatasetTable';

const meta: Meta<typeof DatasetTable> = {
  title: 'Pages/DatasetTable (msw)',
  component: DatasetTable,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof DatasetTable>;

/**
 * 元数据集 ProTable（服务端分页），数据经 axios → msw 自含。
 * play 即 E2E 夹具：断言首行 mock 数据渲染（test-runner 在 Storybook 上跑）。
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('ods.table_1')).toBeInTheDocument();
    });
  },
};
