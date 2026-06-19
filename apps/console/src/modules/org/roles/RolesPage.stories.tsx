import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { RolesPage } from './RolesPage';

const meta: Meta<typeof RolesPage> = {
  title: 'Pages/Org/Roles (msw)',
  component: RolesPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof RolesPage>;

/** 角色清单：ProTable 数据经 axios → msw（`/api/org/roles`）自含。play 断言内置角色显示名渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('Tenant Admin')).toBeInTheDocument();
    });
  },
};
