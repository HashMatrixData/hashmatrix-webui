import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { CatalogPage } from './CatalogPage';

const meta: Meta<typeof CatalogPage> = {
  title: 'Pages/Catalog (msw)',
  component: CatalogPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof CatalogPage>;

/** 数据地图：资产目录 ProTable，数据经 axios → msw 自含。play 断言首行 mock 数据渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('ods.table_1')).toBeInTheDocument();
    });
  },
};
