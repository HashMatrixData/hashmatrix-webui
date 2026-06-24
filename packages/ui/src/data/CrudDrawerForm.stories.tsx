import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button, Form, Input } from 'antd';
import { CrudDrawerForm } from './CrudDrawerForm';
import { useCrudMutation } from './useCrudMutation';

interface DemoValues {
  name: string;
}

/**
 * Story 测试装置：把 {@link useCrudMutation} + {@link CrudDrawerForm} 按消费方真实姿势接起来。
 * `submitter` 由各 story 注入（成功/抛错），用以覆盖三态。成功后把值落到画布内（`saved:*`）供断言——
 * 抽屉内容 portal 到 document.body，故抽屉态断言走 `within(document.body)`，成功信号留在画布内。
 */
function Harness({
  submitter,
  errorText,
}: {
  submitter: (v: DemoValues) => Promise<unknown>;
  errorText: string;
}) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const { submit, submitting, errorNode, reset } = useCrudMutation<DemoValues>(submitter, {
    errorText,
    onSuccess: () => {
      // 真实场景：queryClient.invalidateQueries() / actionRef.current?.reload()——由 app 注入。
    },
  });

  const handleSubmit = async (values: DemoValues) => {
    const ok = await submit(values);
    if (ok) setSaved(values.name);
    return ok;
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      {saved && <div>saved:{saved}</div>}
      <CrudDrawerForm<DemoValues>
        open={open}
        onOpenChange={setOpen}
        title="New Item"
        submitText="Save"
        cancelText="Cancel"
        submitting={submitting}
        errorNode={errorNode}
        onReset={reset}
        onSubmit={handleSubmit}
      >
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
          <Input />
        </Form.Item>
      </CrudDrawerForm>
    </>
  );
}

const meta: Meta<typeof Harness> = {
  title: 'Data/CrudDrawerForm',
  component: Harness,
};
export default meta;

type Story = StoryObj<typeof Harness>;

/** 提交成功：填合法值 → Save → 抽屉自动关闭（字段销毁）、成功信号回显。 */
export const SubmitSuccess: Story = {
  render: () => <Harness submitter={async () => ({ id: '1' })} errorText="Submit failed" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Open' }));

    const input = (await body.findByLabelText('Name')) as HTMLInputElement;
    await userEvent.type(input, 'Acme');
    await userEvent.click(body.getByRole('button', { name: 'Save' }));

    // 成功 → 画布内回显 saved:Acme，且抽屉关闭（destroyOnHidden ⇒ 字段不再存在）。
    await waitFor(async () => {
      await expect(await canvas.findByText('saved:Acme')).toBeInTheDocument();
    });
    expect(document.querySelector('#name')).toBeNull();
  },
};

/** 校验失败：不填必填项 → Save → 字段内联报错、抽屉保持打开、不触发提交。 */
export const ValidationError: Story = {
  render: () => <Harness submitter={async () => ({ id: '1' })} errorText="Submit failed" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Open' }));
    await userEvent.click(await body.findByRole('button', { name: 'Save' }));

    await expect(await body.findByText('Name is required')).toBeInTheDocument();
    expect(document.querySelector('#name')).not.toBeNull(); // 抽屉仍打开
    expect(canvas.queryByText(/^saved:/)).toBeNull(); // 未提交
  },
};

/** 提交出错：submitter 抛错 → 内联错误 Alert 回显、抽屉保持打开。 */
export const SubmitError: Story = {
  render: () => (
    <Harness
      submitter={async () => {
        throw new Error('boom');
      }}
      errorText="Submit failed"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Open' }));

    const input = (await body.findByLabelText('Name')) as HTMLInputElement;
    await userEvent.type(input, 'Acme');
    await userEvent.click(body.getByRole('button', { name: 'Save' }));

    await expect(await body.findByText('Submit failed')).toBeInTheDocument();
    expect(document.querySelector('#name')).not.toBeNull(); // 抽屉仍打开
    expect(canvas.queryByText(/^saved:/)).toBeNull(); // 未落库
  },
};

/**
 * 取消后重开复位（守 [B1]）：失败 Alert + 已填值在「取消关闭」后不得残留到「重新打开」。
 * 受控复用同一挂载实例下，错误态归 hook、字段值归 Form——两者都须在关闭路径复位。
 */
export const CancelReopenClearsState: Story = {
  render: () => (
    <Harness
      submitter={async () => {
        throw new Error('boom');
      }}
      errorText="Submit failed"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    // 1. 打开 → 填值 → 提交失败 → 错误 Alert 出现
    await userEvent.click(canvas.getByRole('button', { name: 'Open' }));
    await userEvent.type((await body.findByLabelText('Name')) as HTMLInputElement, 'Acme');
    await userEvent.click(body.getByRole('button', { name: 'Save' }));
    await expect(await body.findByText('Submit failed')).toBeInTheDocument();

    // 2. 取消关闭
    await userEvent.click(body.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(document.querySelector('#name')).toBeNull());

    // 3. 重新打开 → 无残留错误、字段为空
    await userEvent.click(canvas.getByRole('button', { name: 'Open' }));
    const reopened = (await body.findByLabelText('Name')) as HTMLInputElement;
    expect(reopened.value).toBe('');
    expect(body.queryByText('Submit failed')).toBeNull();
  },
};
