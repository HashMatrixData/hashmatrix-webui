import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { http, HttpResponse } from 'msw';
import { IntegrationPage } from './IntegrationPage';
import { emptyList, errorList } from '@/mocks/testHandlers';
import { resetDataSources } from '@/mocks/dataSources';

const DS_API = '*/api/datasources';

const meta: Meta<typeof IntegrationPage> = {
  title: 'Pages/Integration (数据源接入)',
  component: IntegrationPage,
  parameters: { layout: 'fullscreen' },
  // 每个 story 渲染前复位数据源 store，保证起点确定（与全局 mswLoader 组合）。
  loaders: [
    async () => {
      resetDataSources();
      return {};
    },
  ],
};
export default meta;

type Story = StoryObj<typeof IntegrationPage>;

/** 填表单字段（抽屉 portal 到 document.body；字段 id = Form.Item name）。 */
async function fillForm() {
  await userEvent.type(document.querySelector('#name') as HTMLInputElement, 'acme_new_ds');
  await userEvent.type(document.querySelector('#host') as HTMLInputElement, 'db.example.com');
  await userEvent.type(document.querySelector('#db') as HTMLInputElement, 'acme_app_new');
  await userEvent.type(document.querySelector('#username') as HTMLInputElement, 'demo_reader');
  await userEvent.type(document.querySelector('#password') as HTMLInputElement, 'demo-secret');
  // type=mysql、port=3306 由 initialValue 提供，无需填写。
}

/** 默认：数据源列表经 axios → msw（`/api/datasources`）自含。断言种子行渲染。 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText('acme_mysql_demo_1')).toBeInTheDocument();
    });
  },
};

/** 空态：msw 返回空页 → ProTable「暂无数据」。 */
export const Empty: Story = {
  parameters: { msw: { handlers: [emptyList(DS_API)] } },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      expect(canvasElement.querySelector('.ant-empty')).not.toBeNull();
    });
  },
};

/** 错误态：msw 返回 500 → 降级空表 + 内联错误 Alert。 */
export const LoadError: Story = {
  parameters: { msw: { handlers: [errorList(DS_API)] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(await canvas.findByText(/数据加载失败/)).toBeInTheDocument();
    });
  },
};

/** 新建成功：打开抽屉 → 填表 → 保存 → 抽屉关闭、列表回显新数据源（POST 落 store + reload）。 */
export const CreateSuccess: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await waitFor(async () => {
      await expect(await canvas.findByText('acme_mysql_demo_1')).toBeInTheDocument();
    });

    await userEvent.click(canvas.getByRole('button', { name: /新建数据源/ }));
    await waitFor(() => expect(document.querySelector('#name')).not.toBeNull());
    await fillForm();
    // antd 会在「两个 CJK 字符」的按钮间插空格（保存→「保 存」），故正则容忍空白。
    await userEvent.click(await body.findByRole('button', { name: /保\s*存/ }));

    // 列表回显新行 + 抽屉关闭（destroyOnHidden 在关闭动画后卸载字段，故用 waitFor 轮询）。
    await waitFor(async () => {
      await expect(await canvas.findByText('acme_new_ds')).toBeInTheDocument();
    });
    await waitFor(() => expect(document.querySelector('#name')).toBeNull());
  },
};

/** 测试连接·成功：填表 → 测试连接 → 成功回显（默认 msw `/test` 返 ok）。 */
export const TestConnectionOk: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(await canvas.findByRole('button', { name: /新建数据源/ }));
    await waitFor(() => expect(document.querySelector('#name')).not.toBeNull());
    await fillForm();
    await userEvent.click(body.getByRole('button', { name: /测试连接/ }));
    await expect(await body.findByText('连接成功')).toBeInTheDocument();
  },
};

/** 测试连接·失败：msw `/test` 覆盖为 `{ ok:false, error }` → 原样回显错误（连不上有真实错误）。 */
export const TestConnectionError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post(`${DS_API}/test`, () => HttpResponse.json({ ok: false, error: 'Access denied' })),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(await canvas.findByRole('button', { name: /新建数据源/ }));
    await waitFor(() => expect(document.querySelector('#name')).not.toBeNull());
    await fillForm();
    await userEvent.click(body.getByRole('button', { name: /测试连接/ }));
    await expect(await body.findByText(/连接失败：Access denied/)).toBeInTheDocument();
  },
};
