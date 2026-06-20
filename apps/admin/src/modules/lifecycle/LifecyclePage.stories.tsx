import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { LifecyclePage } from './LifecyclePage';
import { emptyList, errorList } from '@/mocks/testHandlers';

// 取数路径（命中 control-plane mock 列表端点）。per-story 覆盖全局 handler 造空/错态。
const TENANTS_API = '*/control-plane/v1/tenants';

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

/** 空态：msw 返回空页 → 无可操作租户 → Table 显示空态（.ant-table-placeholder），无业务行。 */
export const Empty: Story = {
  parameters: { msw: { handlers: [emptyList(TENANTS_API)] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvasElement.querySelector('.ant-table-placeholder')).not.toBeNull();
    });
    expect(canvas.queryByText('Acme Demo')).toBeNull();
  },
};

/** 错误态：msw 返回 500 → useQuery isError → 页内错误 Alert（role=alert，与空态可区分）。 */
export const LoadError: Story = {
  parameters: { msw: { handlers: [errorList(TENANTS_API)] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText(/数据加载失败/)).toBeInTheDocument();
    });
    expect(canvas.queryByText('Acme Demo')).toBeNull();
  },
};
