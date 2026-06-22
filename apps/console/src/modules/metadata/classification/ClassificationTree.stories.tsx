import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { resetClassifications } from '@/mocks/classifications';
import { ClassificationTree } from './ClassificationTree';

const meta: Meta<typeof ClassificationTree> = {
  title: 'Pages/ClassificationTree (msw)',
  component: ClassificationTree,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof ClassificationTree>;

/**
 * 分类树（E2E）：断言预置节点渲染，选中后详情面板显示其 key。
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    resetClassifications();
    const canvas = within(canvasElement);

    // 预置根节点渲染（树默认展开）。
    await expect(await waitFor(async () => canvas.findByText('技术分类'))).toBeInTheDocument();

    // 选中子节点「存储」，详情面板显示其唯一全路径 key。
    await userEvent.click(await canvas.findByText('存储'));
    await waitFor(async () => {
      await expect(await canvas.findByText('tech.storage')).toBeInTheDocument();
    });
  },
};
