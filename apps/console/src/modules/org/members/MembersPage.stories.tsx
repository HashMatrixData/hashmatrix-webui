import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { RequireRole, ROLES, useMockSessionStore } from '@hashmatrix/sdk';
import { MembersPage } from './MembersPage';

const meta: Meta<typeof MembersPage> = {
  title: 'Pages/Org/Members (msw)',
  component: MembersPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof MembersPage>;

// mock 会话默认角色集（= store 初值）。门控 story 共享该 mock 会话单例，故 play 首尾自治：
// 起点设本 story 所需角色、收尾复位到此，避免跨 story 角色泄漏（与 #15 TenantSwitcher 同纪律）。
const DEFAULT_ROLES = [ROLES.ADMIN, ROLES.GOVERNANCE_EDITOR, ROLES.VIEWER];

/** 默认：成员 ProTable，数据经 axios → msw（`/api/org/members`）自含。play 断言首行 mock 成员渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('Demo User 1')).toBeInTheDocument();
    });
  },
};

/**
 * 角色门控·有权限（验收②「有角色」态）：含 admin 角色经路由级 `RequireRole` 放行 → 成员表渲染。
 * （路由 `/settings/users` 即以此 `RequireRole` 包裹，见 router.tsx；此处复刻其守卫以隔离演示。）
 */
export const Authorized: Story = {
  render: () => (
    <RequireRole roles={[ROLES.ADMIN]}>
      <MembersPage />
    </RequireRole>
  ),
  play: async ({ canvasElement }) => {
    useMockSessionStore.getState().setRoles([ROLES.ADMIN]); // 自含起点
    try {
      const canvas = within(canvasElement);
      await waitFor(async () => {
        await expect(await canvas.findByText('Demo User 1')).toBeInTheDocument();
      });
    } finally {
      useMockSessionStore.getState().setRoles(DEFAULT_ROLES); // 复位（异常安全 ⇒ 顺序无关，无跨 story 角色泄漏）
    }
  },
};

/**
 * 角色门控·无权限（验收②「无角色」态）：仅 viewer → `RequireRole` 兜底渲染 403，成员表不渲染。
 * 证明「无角色时路由级守卫兜底」；菜单级隐藏（无角色时整组消失）另由 navConfig + `filterNavByRole` 单测覆盖。
 */
export const Forbidden: Story = {
  render: () => (
    <RequireRole roles={[ROLES.ADMIN]}>
      <MembersPage />
    </RequireRole>
  ),
  play: async ({ canvasElement }) => {
    useMockSessionStore.getState().setRoles([ROLES.VIEWER]); // 自含起点：无 admin
    try {
      const canvas = within(canvasElement);
      // AntD `Result`（403）渲染 `.ant-result`——locale 无关的稳定信号。
      await waitFor(() => {
        expect(canvasElement.querySelector('.ant-result')).not.toBeNull();
      });
      expect(canvas.queryByText('Demo User 1')).toBeNull(); // 成员表确未渲染
    } finally {
      useMockSessionStore.getState().setRoles(DEFAULT_ROLES); // 复位（异常安全 ⇒ 顺序无关，无跨 story 角色泄漏）
    }
  },
};
