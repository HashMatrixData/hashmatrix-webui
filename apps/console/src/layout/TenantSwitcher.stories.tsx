import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMockSessionStore } from '@hashmatrix/sdk';
import type { MembershipView } from '@/api/types';
import { TenantSwitcher } from './TenantSwitcher';

// 独立 QueryClient（关闭重试）——本组件用 TanStack Query 取数，全局 preview 未装配 QueryClientProvider。
// staleTime 默认 0 ⇒ 每次 story 挂载即重取，故不同 story 的 msw override 不会被彼此缓存串味。
const storyQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const meta: Meta<typeof TenantSwitcher> = {
  title: 'Layout/TenantSwitcher (msw)',
  component: TenantSwitcher,
  decorators: [
    (Story) => (
      <QueryClientProvider client={storyQueryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof TenantSwitcher>;

/**
 * 默认（M1）：membership 经 axios → msw（`/v1/me/tenants`，全局 handler 返 1 个租户）。
 * play 断言 mock 租户显示名渲染（验收①②：取数调通 + 当前会话租户落到选中项）。
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    useMockSessionStore.getState().setTenant('tenant-demo'); // 自含起点，避免跨 story 泄漏
    await waitFor(async () => {
      await expect(await canvas.findByText('Demo Tenant')).toBeInTheDocument();
    });
  },
};

/** 多租户 membership（脱敏占位）——演示 D1 多 org membership；本 story 覆盖 `/me/tenants` 返多个的场景。 */
const TWO_TENANTS: MembershipView[] = [
  { tenantId: 'tenant-demo', tenantKey: 'tenant-demo', displayName: 'Demo Tenant', status: 'active', roles: ['tenant-admin'] },
  { tenantId: 'acme', tenantKey: 'acme', displayName: 'Acme Demo', status: 'active' },
];

/**
 * 多租户切换（验收③：选择切换走 D2 语义占位）。msw 本 story 覆盖 `/me/tenants` 返 2 个 membership（D1）。
 * play：打开下拉 → 选第二个租户 → 断言会话租户被更新为该租户（D2：切换 = 重换 token 占位，
 * `X-Tenant-Id` 唯一来源=会话；mock 下经 `setTenant` 即时换 seed），且选中项显示名随之变化。
 */
export const MultiTenant: Story = {
  parameters: {
    msw: { handlers: [http.get('*/v1/me/tenants', () => HttpResponse.json(TWO_TENANTS))] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    useMockSessionStore.getState().setTenant('tenant-demo'); // 自含起点：当前租户 = tenant-demo

    await waitFor(async () => {
      await expect(await canvas.findByText('Demo Tenant')).toBeInTheDocument();
    });

    // 打开 AntD Select 下拉（mouseDown 是其稳定打开触发），选第二个租户。
    fireEvent.mouseDown(canvas.getByRole('combobox'));
    await userEvent.click(await within(document.body).findByText('Acme Demo'));

    // D2 语义占位：切换即更新会话当前租户（X-Tenant-Id 之唯一来源）——确定性断言。
    await waitFor(() => {
      expect(useMockSessionStore.getState().tenant).toBe('acme');
    });
    // 选中项显示名随之变化（findAllBy：AntD 会同时渲染 aria-live 播报 + 选中态文本，故允许多个匹配）。
    expect((await canvas.findAllByText('Acme Demo')).length).toBeGreaterThan(0);

    useMockSessionStore.getState().setTenant('tenant-demo'); // 复位，避免跨 story 泄漏
  },
};
