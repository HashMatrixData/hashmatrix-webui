import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { RequireRole, ROLES, useMockSessionStore } from '@hashmatrix/sdk';
import { GovernancePage } from './GovernancePage';

// mock 会话默认角色集（= store 初值）；门控 story play 首尾自治复位，避免跨 story 角色泄漏。
const DEFAULT_ROLES = [ROLES.ADMIN, ROLES.GOVERNANCE_EDITOR, ROLES.VIEWER];

const meta: Meta<typeof GovernancePage> = {
  title: 'Pages/Governance (msw)',
  component: GovernancePage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof GovernancePage>;

/** 默认（有权限）：默认会话含 governance:editor/admin → 治理页渲染（含数据集表）。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('ods.table_1')).toBeInTheDocument();
    });
  },
};

/**
 * 角色门控·无权限：仅 viewer → 路由级 `RequireRole`（governance:editor / admin）兜底渲染 403，治理内容不渲染。
 * 复刻 router.tsx 对 `/governance` 的守卫，以隔离演示「无角色时路由守卫兜底」（跨 #14 RBAC 不变量）。
 */
export const Forbidden: Story = {
  render: () => (
    <RequireRole roles={[ROLES.GOVERNANCE_EDITOR, ROLES.ADMIN]}>
      <GovernancePage />
    </RequireRole>
  ),
  play: async ({ canvasElement }) => {
    useMockSessionStore.getState().setRoles([ROLES.VIEWER]); // 自含起点：无 editor/admin
    try {
      await waitFor(() => {
        expect(canvasElement.querySelector('.ant-result')).not.toBeNull();
      });
      expect(within(canvasElement).queryByText('ods.table_1')).toBeNull();
    } finally {
      useMockSessionStore.getState().setRoles(DEFAULT_ROLES); // 复位（异常安全）
    }
  },
};
