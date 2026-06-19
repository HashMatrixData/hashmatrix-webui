import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { ServicePage } from './ServicePage';

const meta: Meta<typeof ServicePage> = {
  title: 'Pages/Service (数据服务)',
  component: ServicePage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof ServicePage>;

/** 数据 API 清单：ProTable 渲染脱敏 demo。play 即 E2E 夹具：断言首行 API 名渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('get_acme_ods_1')).toBeInTheDocument();
    });
  },
};
