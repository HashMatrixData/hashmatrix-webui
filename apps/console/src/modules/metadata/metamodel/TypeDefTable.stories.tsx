import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { resetTypedefs } from '@/mocks/typedefs';
import { TypeDefTable } from './TypeDefTable';

const meta: Meta<typeof TypeDefTable> = {
  title: 'Pages/TypeDefTable (msw)',
  component: TypeDefTable,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof TypeDefTable>;

/**
 * 元类 ProTable（服务端分页），数据经 axios → msw 自含。
 * play 即 E2E 夹具：断言首行渲染，点击行打开只读详情 Drawer 并断言属性可见。
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 首行 mock 元类渲染。
    const baseCell = await waitFor(async () => canvas.findByText('DataAsset'));
    await expect(baseCell).toBeInTheDocument();

    // 点击整行（而非 Tag 文本节点）打开详情 Drawer，断言属性定义在 Drawer 容器内出现。
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
    await waitFor(async () => canvas.findByText('DataAsset'));
    await userEvent.click(await canvas.findByRole('button', { name: /新建元类/ }));

    const dialog = await body.findByRole('dialog');
    const form = within(dialog);
    await userEvent.type(await form.findByLabelText('编码'), 'DemoType');
    await userEvent.type(await form.findByLabelText('名称'), 'Demo 元类');

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

    await waitFor(async () => canvas.findByText('DataAsset'));
    await userEvent.click(await canvas.findByRole('button', { name: /新建元类/ }));

    const dialog = await body.findByRole('dialog');
    const form = within(dialog);
    await userEvent.type(await form.findByLabelText('编码'), 'DataAsset');
    await userEvent.type(await form.findByLabelText('名称'), '重复编码');
    await userEvent.click(dialog.querySelector<HTMLElement>('.ant-btn-primary')!);

    // 前端校验拦下：抽屉仍在、报「编码已存在」。
    await waitFor(async () => {
      await expect(await form.findByText('编码已存在')).toBeInTheDocument();
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

    const cell = await waitFor(async () => canvas.findByText('DataAsset'));
    const row = cell.closest('tr');
    await expect(row).not.toBeNull();
    const rowScope = within(row!);
    await expect(rowScope.getByText('只读')).toBeInTheDocument();
    await expect(rowScope.queryByText('编辑')).toBeNull();
  },
};
