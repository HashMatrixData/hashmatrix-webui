import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { resetRelationships } from '@/mocks/relationships';
import { RelationshipTable } from './RelationshipTable';

const meta: Meta<typeof RelationshipTable> = {
  title: 'Pages/RelationshipTable (msw)',
  component: RelationshipTable,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof RelationshipTable>;

/**
 * 关系定义 ProTable（服务端分页），数据经 axios → msw 自含。
 * play 即 E2E：断言首行渲染，点击行打开只读详情并断言端点可见。
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    resetRelationships();
    const canvas = within(canvasElement);

    const cell = await waitFor(async () => canvas.findByText('table_columns'));
    await expect(cell).toBeInTheDocument();

    const row = cell.closest('tr');
    await expect(row).not.toBeNull();
    await userEvent.click(row!);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    await waitFor(async () => {
      await expect(await within(dialog).findByText('Table.columns')).toBeInTheDocument();
    });
  },
};
