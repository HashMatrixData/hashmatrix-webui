import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { ApprovalsPage } from './ApprovalsPage';
import { emptyList, errorList } from '@/mocks/testHandlers';

// 取数路径（命中 control-plane mock 列表端点）。per-story 覆盖全局 handler 造空/错态。
const TENANTS_API = '*/control-plane/v1/tenants';

const meta: Meta<typeof ApprovalsPage> = {
  title: 'Admin/Approvals',
  component: ApprovalsPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof ApprovalsPage>;

/** 注册审批：待审列表 + 通过/驳回。play 断言待审申请（mock）渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      // 断言显示名（唯一）——待审租户 tenant-soylent 的 tenantId 与 orgAlias 同值，会命中多列。
      await expect(await canvas.findByText('Soylent Demo')).toBeInTheDocument();
    });
  },
};

/** 空态：msw 返回空页 → 无待审租户 → Table 显示空态（.ant-table-placeholder），无业务行。 */
export const Empty: Story = {
  parameters: { msw: { handlers: [emptyList(TENANTS_API)] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvasElement.querySelector('.ant-table-placeholder')).not.toBeNull();
    });
    expect(canvas.queryByText('Soylent Demo')).toBeNull();
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
    expect(canvas.queryByText('Soylent Demo')).toBeNull();
  },
};
