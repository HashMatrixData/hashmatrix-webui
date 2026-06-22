import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { resetTypedefs } from '@/mocks/typedefs';
import { TemplatesPage } from './TemplatesPage';

const meta: Meta<typeof TemplatesPage> = {
  title: 'Pages/TemplatesPage (msw)',
  component: TemplatesPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof TemplatesPage>;

/**
 * 模板库（E2E）：导入 MySQL 族 → 断言「新增 3」；再次导入 → 幂等「跳过 3」。
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    resetTypedefs();
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    // MySQL 模板卡片渲染。
    const card = (await waitFor(async () => canvas.findByText('MySQL 关系模型'))).closest(
      '.ant-card',
    ) as HTMLElement;
    await expect(card).not.toBeNull();
    const cardScope = within(card);

    const importOnce = async () => {
      await userEvent.click(cardScope.getByRole('button', { name: /导入/ }));
      // antd Popconfirm 确认按钮在两 CJK 字间插空格，按名匹配不稳，按类名取主按钮。
      const ok = await waitFor(() => {
        const btn = canvasElement.ownerDocument.querySelector<HTMLElement>(
          '.ant-popconfirm-buttons .ant-btn-primary',
        );
        if (!btn) throw new Error('popconfirm ok button not found');
        return btn;
      });
      await userEvent.click(ok);
    };

    // 首次导入：mock 新增 3 个元类（mysql_database/table/column）。
    await importOnce();
    await waitFor(async () => {
      await expect(await body.findByText(/新增 3/)).toBeInTheDocument();
    });

    // 再次导入：编码已存在 → 幂等跳过 3。
    await importOnce();
    await waitFor(async () => {
      await expect(await body.findByText(/跳过 3/)).toBeInTheDocument();
    });
  },
};
