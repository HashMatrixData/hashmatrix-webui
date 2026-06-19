import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { ApprovalsPage } from './ApprovalsPage';

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
