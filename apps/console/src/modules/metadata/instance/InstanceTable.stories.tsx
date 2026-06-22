import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { resetInstances } from '@/mocks/instances';
import { InstanceTable } from './InstanceTable';

const meta: Meta<typeof InstanceTable> = {
  title: 'Pages/InstanceTable (msw)',
  component: InstanceTable,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof InstanceTable>;

/**
 * 实例 ProTable（E2E）：断言首行渲染，点行看详情（历史）。
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    resetInstances();
    const canvas = within(canvasElement);

    const cell = await waitFor(async () => canvas.findByText('dwd.order_fact'));
    const row = cell.closest('tr');
    await expect(row).not.toBeNull();
    await userEvent.click(row!);

    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    await waitFor(async () => {
      await expect(await within(dialog).findByText('采集入库')).toBeInTheDocument();
    });
  },
};

/**
 * 认领流程（E2E · #13）：未认领实例点「认领」→ 行内显示已认领。
 */
export const ClaimFlow: Story = {
  play: async ({ canvasElement }) => {
    resetInstances();
    const canvas = within(canvasElement);

    // dwd.order_fact 初始未认领。
    const row = (await waitFor(async () => canvas.findByText('dwd.order_fact'))).closest('tr')!;
    await expect(within(row).getByText('认领')).toBeInTheDocument();

    await userEvent.click(within(row).getByText('认领'));

    // reload 后该行操作列转「已认领」。
    await waitFor(async () => {
      const r = (await canvas.findByText('dwd.order_fact')).closest('tr')!;
      await expect(within(r).getByText('已认领')).toBeInTheDocument();
    });
  },
};

/**
 * 已认领实例（E2E · #13）：ods.user_raw 已被 analyst-a 认领，操作列为「已认领」、无认领入口。
 */
export const AlreadyClaimed: Story = {
  play: async ({ canvasElement }) => {
    resetInstances();
    const canvas = within(canvasElement);

    const row = (await waitFor(async () => canvas.findByText('ods.user_raw'))).closest('tr')!;
    const rowScope = within(row);
    await expect(rowScope.getByText('已认领')).toBeInTheDocument();
    await expect(rowScope.getByText('analyst-a')).toBeInTheDocument();
    // 无可点击的「认领」入口（精确匹配，不与「已认领」冲突）。
    await expect(rowScope.queryByText('认领')).toBeNull();
  },
};
