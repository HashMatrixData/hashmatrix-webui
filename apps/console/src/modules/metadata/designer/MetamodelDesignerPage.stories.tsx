import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { resetTypedefs } from '@/mocks/typedefs';
import { resetRelationships } from '@/mocks/relationships';
import { resetClassifications } from '@/mocks/classifications';
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

/**
 * 工作台集成（E2E）：分类树持久内嵌；点「模板库」打开抽屉看到模板族。
 */
export const Workspace: Story = {
  play: async ({ canvasElement }) => {
    resetTypedefs();
    resetRelationships();
    resetClassifications();
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    // 分类树持久内嵌（迁入设计器）。
    await expect(await waitFor(async () => canvas.findByText('技术分类'))).toBeInTheDocument();

    // 模板库抽屉（复用 TemplatesPage）。
    await userEvent.click(canvas.getByRole('button', { name: /模板库/ }));
    await waitFor(async () => {
      await expect(await body.findByText('MySQL 关系模型')).toBeInTheDocument();
    });
  },
};

/**
 * 连线建继承模式（A1）：切「连线建继承」→ 画布进连线模式、提示更新。
 * 注：X6 磁吸拖拽建边无法在 test-runner 稳定驱动，建边逻辑（写 superType + 环检测）
 * 经隔离审查 + dev 手验；本 story 守护模式开关与画布连线配置不被破坏。
 */
export const ConnectMode: Story = {
  play: async ({ canvasElement }) => {
    resetTypedefs();
    resetRelationships();
    const canvas = within(canvasElement);

    await waitFor(async () => canvas.findByText('数据资产基类'));
    await userEvent.click(canvas.getByRole('button', { name: /连线建继承/ }));
    await waitFor(async () => {
      await expect(await canvas.findByText(/连线模式/)).toBeInTheDocument();
    });
  },
};
