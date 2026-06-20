import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { CatalogPage } from './CatalogPage';
import { emptyList, errorList, slowList } from '@/mocks/testHandlers';

// CatalogPage 复用 governance/DatasetTable（取 `/api/datasets`）。本页承载 DatasetTable 的「状态矩阵」
// （Empty/LoadError/Loading/Search）；governance 的 DatasetTable.stories 仅留按钮级权限 demo，避免同组件重复。
const DATASETS_API = '*/api/datasets';

const meta: Meta<typeof CatalogPage> = {
  title: 'Pages/Catalog (msw)',
  component: CatalogPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof CatalogPage>;

/** 默认（正常态）：资产目录 ProTable，数据经 axios → msw 自含。play 断言首行 mock 数据渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('ods.table_1')).toBeInTheDocument();
    });
  },
};

/** 空态：msw 返回空页 → ProTable 显示「暂无数据」（.ant-empty），无业务行。 */
export const Empty: Story = {
  parameters: { msw: { handlers: [emptyList(DATASETS_API)] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvasElement.querySelector('.ant-empty')).not.toBeNull();
    });
    expect(canvas.queryByText('ods.table_1')).toBeNull();
  },
};

/** 错误态：msw 返回 500 → useTableRequest 降级空表 + 内联错误 Alert（role=alert，与空态可区分）。 */
export const LoadError: Story = {
  parameters: { msw: { handlers: [errorList(DATASETS_API)] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText(/数据加载失败/)).toBeInTheDocument();
    });
    expect(canvas.queryByText('ods.table_1')).toBeNull();
  },
};

/** 加载态：msw 延迟 1.5s（有限延迟，不卡 test-runner 的 networkidle）→ 断言加载指示存在。 */
export const Loading: Story = {
  parameters: { msw: { handlers: [slowList(DATASETS_API)] } },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      expect(canvasElement.querySelector('.ant-spin-spinning, .ant-skeleton')).not.toBeNull();
    });
  },
};

/** 交互·搜索：按名称搜索 → 列表过滤为命中行、非命中行消失（搜索维度交互断言）。 */
export const Search: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('ods.table_1')).toBeInTheDocument();
    });
    const input = canvasElement.querySelector('input#name') as HTMLInputElement | null;
    expect(input).not.toBeNull();
    await userEvent.type(input!, 'table_55');
    await userEvent.keyboard('{Enter}'); // 提交查询（规避 CJK 按钮文案的脆弱匹配）
    await waitFor(async () => {
      await expect(await canvas.findByText('dws.table_55')).toBeInTheDocument();
    });
    expect(canvas.queryByText('ods.table_1')).toBeNull();
  },
};
