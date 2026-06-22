import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { EventsTable } from './EventsTable';

const meta: Meta<typeof EventsTable> = {
  title: 'Pages/EventsTable (msw)',
  component: EventsTable,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof EventsTable>;

/**
 * 变更事件流（E2E）：断言首行渲染，点行看事件详情（topic）。
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 锚定唯一摘要（id 未渲染为列，rowKey 仅作 React key）。
    const row = (await waitFor(async () => canvas.findByText('实例认领：tenant-demo'))).closest('tr')!;
    await userEvent.click(row);

    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    await waitFor(async () => {
      await expect(
        await within(dialog).findByText('hashmatrix.governance.metadata.instance'),
      ).toBeInTheDocument();
    });
  },
};
