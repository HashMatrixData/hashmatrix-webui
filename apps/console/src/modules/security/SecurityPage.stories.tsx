import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { SecurityPage } from './SecurityPage';

const meta: Meta<typeof SecurityPage> = {
  title: 'Pages/Security (数据安全)',
  component: SecurityPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof SecurityPage>;

/** 分类分级资产清单：ProTable 渲染脱敏 demo。play 即 E2E 夹具：断言首行资产渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('ods.field_1')).toBeInTheDocument();
    });
  },
};
