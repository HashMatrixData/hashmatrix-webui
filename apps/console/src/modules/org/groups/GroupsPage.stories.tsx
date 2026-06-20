import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { RequireRole, ROLES, useMockSessionStore } from '@hashmatrix/sdk';
import { GroupsPage } from './GroupsPage';
import { emptyList, errorList } from '@/mocks/testHandlers';

const GROUPS_API = '*/api/org/groups';
// mock 会话默认角色集（= store 初值）；门控 story play 首尾自治复位，避免跨 story 角色泄漏。
const DEFAULT_ROLES = [ROLES.ADMIN, ROLES.GOVERNANCE_EDITOR, ROLES.VIEWER];

const meta: Meta<typeof GroupsPage> = {
  title: 'Pages/Org/Groups (msw)',
  component: GroupsPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof GroupsPage>;

/** 默认（正常态）：用户组 ProTable，数据经 axios → msw 自含。play 断言首个 mock 组名渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('platform-ops')).toBeInTheDocument();
    });
  },
};

/** 空态：msw 返回空页 → ProTable 显示「暂无数据」，无业务行。 */
export const Empty: Story = {
  parameters: { msw: { handlers: [emptyList(GROUPS_API)] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvasElement.querySelector('.ant-empty')).not.toBeNull();
    });
    expect(canvas.queryByText('platform-ops')).toBeNull();
  },
};

/** 错误态：msw 返回 500 → 降级空表 + 内联错误 Alert（与空态可区分）。 */
export const LoadError: Story = {
  parameters: { msw: { handlers: [errorList(GROUPS_API)] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText(/数据加载失败/)).toBeInTheDocument();
    });
    expect(canvas.queryByText('platform-ops')).toBeNull();
  },
};

/** 角色门控·无权限：仅 viewer → 路由级 `RequireRole` 兜底渲染 403，用户组表不渲染（route guard 兜底）。 */
export const Forbidden: Story = {
  render: () => (
    <RequireRole roles={[ROLES.ADMIN]}>
      <GroupsPage />
    </RequireRole>
  ),
  play: async ({ canvasElement }) => {
    useMockSessionStore.getState().setRoles([ROLES.VIEWER]); // 自含起点：无 admin
    try {
      await waitFor(() => {
        expect(canvasElement.querySelector('.ant-result')).not.toBeNull();
      });
      expect(within(canvasElement).queryByText('platform-ops')).toBeNull();
    } finally {
      useMockSessionStore.getState().setRoles(DEFAULT_ROLES); // 复位（异常安全）
    }
  },
};
