import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { TypeDefTable } from './TypeDefTable';

const meta: Meta<typeof TypeDefTable> = {
  title: 'Pages/TypeDefTable (msw)',
  component: TypeDefTable,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof TypeDefTable>;

/**
 * 元类 ProTable（服务端分页），数据经 axios → msw 自含。
 * play 即 E2E 夹具：断言首行渲染，点击行打开只读详情 Drawer 并断言属性可见。
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 首行 mock 元类渲染。
    const baseCell = await waitFor(async () => canvas.findByText('DataAsset'));
    await expect(baseCell).toBeInTheDocument();

    // 点击整行（而非 Tag 文本节点）打开详情 Drawer，断言属性定义在 Drawer 容器内出现。
    const row = baseCell.closest('tr');
    await expect(row).not.toBeNull();
    await userEvent.click(row!);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    await waitFor(async () => {
      await expect(await within(dialog).findByText('qualifiedName')).toBeInTheDocument();
    });
  },
};
