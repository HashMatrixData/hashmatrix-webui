import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { GroupsPage } from './GroupsPage';

const meta: Meta<typeof GroupsPage> = {
  title: 'Pages/Org/Groups (msw)',
  component: GroupsPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof GroupsPage>;

/** 用户组清单：ProTable 数据经 axios → msw（`/api/org/groups`）自含。play 断言首个 mock 组名渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('platform-ops')).toBeInTheDocument();
    });
  },
};
