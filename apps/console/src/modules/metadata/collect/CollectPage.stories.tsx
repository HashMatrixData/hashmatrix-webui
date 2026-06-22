import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { resetCollect } from '@/mocks/collect';
import { CollectPage } from './CollectPage';

const meta: Meta<typeof CollectPage> = {
  title: 'Pages/CollectPage (msw)',
  component: CollectPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof CollectPage>;

/**
 * 采集衔接（E2E）：点扫描运行的异动行看变更集/异动；对连通数据源触发扫描→新增运行。
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    resetCollect();
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    // 打开含异动的运行（run_0002）详情，断言异动检出。
    const runRow = (await waitFor(async () => canvas.findByText('run_0002'))).closest('tr')!;
    await userEvent.click(runRow);
    const dialog = await body.findByRole('dialog');
    await waitFor(async () => {
      await expect(await within(dialog).findByText('dwd.tmp_*')).toBeInTheDocument();
    });
  },
};

/**
 * 扫描流程（E2E · #14）：对连通数据源触发扫描 → 运行表新增一条。
 * 注：数据源名（如 MySQL 业务库）在数据源表与运行表的 sourceName 列重复出现，
 * 故用「扫描」入口锚定——该入口仅数据源表渲染，运行表无此列。
 */
export const ScanFlow: Story = {
  play: async ({ canvasElement }) => {
    resetCollect();
    const canvas = within(canvasElement);

    // 第一条连通数据源（MySQL 业务库）的扫描入口。
    const scanLinks = await waitFor(async () => canvas.findAllByText('扫描'));
    await userEvent.click(scanLinks[0]);

    // 运行表新增 run_0003。
    await waitFor(async () => {
      await expect(await canvas.findByText('run_0003')).toBeInTheDocument();
    });
  },
};
