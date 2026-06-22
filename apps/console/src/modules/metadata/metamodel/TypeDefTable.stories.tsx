import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { resetTypedefs } from '@/mocks/typedefs';
import { resetTypedefVersions } from '@/mocks/typedefVersions';
import { TypeDefTable } from './TypeDefTable';

const meta: Meta<typeof TypeDefTable> = {
  title: 'Pages/TypeDefTable (msw)',
  component: TypeDefTable,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof TypeDefTable>;

// 锚定 DataAsset 行须用其唯一 displayName——'DataAsset' 既是名也是子类的 superType Tag，文本不唯一。
const ASSET_BASE = '数据资产基类';

/** 点击 Popconfirm 的确认（主）按钮：antd 在两 CJK 字间插空格，按名匹配不稳，按类名取。 */
async function confirmPopconfirm(doc: Document): Promise<void> {
  const ok = await waitFor(() => {
    const btn = doc.querySelector<HTMLElement>('.ant-popconfirm-buttons .ant-btn-primary');
    if (!btn) throw new Error('popconfirm ok button not found');
    return btn;
  });
  await userEvent.click(ok);
}

/**
 * 按文档序填表单的「编码 / 名称」两个文本框。
 * antd Form 的 label 未与 input 原生关联（findByLabelText 报 non-labellable），
 * 故按 `input.ant-input` 取——类别/继承是 select 的搜索框（非 ant-input）、说明是 textarea，均不命中。
 */
async function fillCodeAndName(dialog: HTMLElement, code: string, name: string): Promise<void> {
  const inputs = await waitFor(() => {
    const list = dialog.querySelectorAll<HTMLInputElement>('input.ant-input');
    if (list.length < 2) throw new Error('form text inputs not ready');
    return list;
  });
  await userEvent.type(inputs[0], code);
  await userEvent.type(inputs[1], name);
}

/**
 * 元类 ProTable（服务端分页），数据经 axios → msw 自含。
 * play 即 E2E 夹具：断言首行渲染，点击行打开只读详情 Drawer 并断言属性可见。
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 首行 mock 元类渲染（按唯一 displayName 定位）。
    const baseCell = await waitFor(async () => canvas.findByText(ASSET_BASE));
    await expect(baseCell).toBeInTheDocument();

    // 点击整行打开详情 Drawer，断言属性定义在 Drawer 容器内出现。
    const row = baseCell.closest('tr');
    await expect(row).not.toBeNull();
    await userEvent.click(row!);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    await waitFor(async () => {
      await expect(await within(dialog).findByText('qualifiedName')).toBeInTheDocument();
    });
  },
};

/**
 * 新建元类流程（E2E）：开抽屉 → 填编码/名称（类别默认 ENTITY）→ 提交 → 断言新行入表。
 * 写接口就地新增并落 TENANT/DRAFT；play 起始 resetTypedefs() 保证交互态/CI 均可重复。
 */
export const CreateFlow: Story = {
  play: async ({ canvasElement }) => {
    resetTypedefs();
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    // 等首屏渲染后打开「新建元类」抽屉。
    await waitFor(async () => canvas.findByText(ASSET_BASE));
    await userEvent.click(await canvas.findByRole('button', { name: /新建元类/ }));

    const dialog = await body.findByRole('dialog');
    await fillCodeAndName(dialog, 'DemoType', 'Demo 元类');

    // 提交：抽屉底部主按钮（在 dialog 作用域内取 primary，避开工具栏新建按钮）。
    const submit = dialog.querySelector<HTMLElement>('.ant-btn-primary');
    await expect(submit).not.toBeNull();
    await userEvent.click(submit!);

    // 新行入表（reload 后 mock 已含 DemoType）。
    await waitFor(async () => {
      await expect(await canvas.findByText('DemoType')).toBeInTheDocument();
    });
  },
};

/**
 * 编码唯一校验（#9）：填入已存在编码 DataAsset，断言前端 ruleNameDup 拦截、不放行提交。
 */
export const DuplicateCode: Story = {
  play: async ({ canvasElement }) => {
    resetTypedefs();
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await waitFor(async () => canvas.findByText(ASSET_BASE));
    await userEvent.click(await canvas.findByRole('button', { name: /新建元类/ }));

    const dialog = await body.findByRole('dialog');
    await fillCodeAndName(dialog, 'DataAsset', '重复编码');
    await userEvent.click(dialog.querySelector<HTMLElement>('.ant-btn-primary')!);

    // 前端校验拦下：抽屉仍在、报「编码已存在」。
    await waitFor(async () => {
      await expect(await within(dialog).findByText('编码已存在')).toBeInTheDocument();
    });
  },
};

/**
 * 作用域门控（#10）：平台公共行（DataAsset / PLATFORM）操作列显示「只读」，无编辑入口。
 */
export const PlatformReadonly: Story = {
  play: async ({ canvasElement }) => {
    resetTypedefs();
    const canvas = within(canvasElement);

    const cell = await waitFor(async () => canvas.findByText(ASSET_BASE));
    const row = cell.closest('tr');
    await expect(row).not.toBeNull();
    const rowScope = within(row!);
    await expect(rowScope.getByText('只读')).toBeInTheDocument();
    await expect(rowScope.queryByText('编辑')).toBeNull();
  },
};

/**
 * 发布流程（#8）：租户私有草稿 BusinessTerm → 发布 → 状态转「已发布」。
 */
export const PublishFlow: Story = {
  play: async ({ canvasElement }) => {
    resetTypedefs();
    resetTypedefVersions();
    const canvas = within(canvasElement);

    // 草稿行渲染。
    const draftRow = (await waitFor(async () => canvas.findByText('BusinessTerm'))).closest('tr')!;
    await expect(within(draftRow).getByText('草稿')).toBeInTheDocument();

    // 点「发布」→ Popconfirm 确认。
    await userEvent.click(within(draftRow).getByText('发布'));
    await confirmPopconfirm(canvasElement.ownerDocument);

    // reload 后该行状态转「已发布」（行 DOM 重建，重新按名定位）。
    await waitFor(async () => {
      const row = (await canvas.findByText('BusinessTerm')).closest('tr')!;
      await expect(within(row).getByText('已发布')).toBeInTheDocument();
    });
  },
};
