import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { resetTypedefs } from '@/mocks/typedefs';
import { resetRelationships } from '@/mocks/relationships';
import { MetamodelDesignerPage } from './MetamodelDesignerPage';

const meta: Meta<typeof MetamodelDesignerPage> = {
  title: 'Pages/MetamodelDesignerPage (msw)',
  component: MetamodelDesignerPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof MetamodelDesignerPage>;

/**
 * 元模型设计器（E2E）：X6 画布渲染元类节点（SVG 文本可断），点击节点→属性面板显示其属性。
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    resetTypedefs();
    resetRelationships();
    const canvas = within(canvasElement);

    // 画布渲染元类节点（DataAsset 的 displayName）。
    const node = await waitFor(async () => canvas.findByText('数据资产基类'));
    await expect(node).toBeInTheDocument();

    // 点击节点 → 右侧属性面板显示 DataAsset 的属性 qualifiedName。
    await userEvent.click(node);
    await waitFor(async () => {
      await expect(await canvas.findByText('qualifiedName')).toBeInTheDocument();
    });
  },
};
