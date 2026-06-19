import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { LifecyclePage } from './LifecyclePage';

const meta: Meta<typeof LifecyclePage> = {
  title: 'Admin/Lifecycle',
  component: LifecyclePage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof LifecyclePage>;

/** 生命周期：启用 / 停用 / 注销。数据经 control-plane msw 自含。play 断言首行 mock 租户与三类操作入口渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      // 断言显示名（唯一）——租户 ID 在 M1 与 orgAlias 同值，断言 tenantId 会命中多列。
      await expect(await canvas.findByText('Acme Demo')).toBeInTheDocument();
    });
    // 每行三类生命周期操作（启用/停用/注销），按钮可达即满足运营入口。
    // 注：AntD 对「两个汉字」按钮会自动插入空格（启用 → “启 用”），故按名匹配需忽略空白。
    const btn = (label: string) =>
      canvas.findAllByRole('button', { name: (n) => n.replace(/\s+/g, '') === label });
    await expect((await btn('启用')).length).toBeGreaterThan(0);
    await expect((await btn('停用')).length).toBeGreaterThan(0);
    await expect((await btn('注销')).length).toBeGreaterThan(0);
  },
};
