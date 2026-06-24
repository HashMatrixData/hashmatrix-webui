import { useRef, type ReactNode } from 'react';
import { Button, Drawer, Form, Space, type FormInstance } from 'antd';

export interface CrudDrawerFormProps<TValues> {
  /** 受控开合（与 onOpenChange 配套）——抽屉开合由调用方掌握，便于「新建/编辑」复用同一组件。 */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  /**
   * 提交处理（通常传 {@link useCrudMutation} 的 `submit`）：返回 `true` 视为成功 → 自动重置并关闭；
   * `false` 保持打开（错误由 `errorNode` 内联回显）。校验失败不会走到这里。
   */
  onSubmit: (values: TValues) => Promise<boolean>;
  /** 提交进行中——驱动确认按钮 loading、禁用取消/遮罩关闭（通常传 useCrudMutation 的 submitting）。 */
  submitting?: boolean;
  /** 内联错误（通常传 useCrudMutation 的 errorNode），渲染在表单顶部。 */
  errorNode?: ReactNode;
  /**
   * 关闭/提交成功后的额外复位（通常传 {@link useCrudMutation} 的 `reset`，用于清错误态）。本组件已自管
   * 表单字段复位；错误态归 hook 所有，故经此回调清除，避免上次失败 Alert 残留到下次打开。
   */
  onReset?: () => void;
  /** 确认/取消按钮文案——由调用方传入（本组件不耦合 i18n，与 useTableRequest/useCrudMutation 一致）。 */
  submitText: string;
  cancelText: string;
  width?: number | string;
  /** 受控表单实例（编辑场景由调用方 `setFieldsValue`）；不传则内部自建。 */
  form?: FormInstance<TValues>;
  /** 表单字段（antd `Form.Item` ...）。 */
  children: ReactNode;
}

/**
 * 可复用「抽屉 + 表单」写侧范式（两 app 共享 · D：共享靠 packages/* 不靠复制）。
 *
 * 与 {@link useCrudMutation} 配套，立起三模块（数据集成/数据目录/组织管理）共用的「列表→新建/编辑→
 * 提交→回显」骨架。**刻意 antd-only**（Drawer + Form），不引 `@ant-design/pro-components`——与
 * `@hashmatrix/ui` 既有依赖面及 useTableRequest 的去耦合设计一致；消费方用 antd `Form.Item` 描述字段。
 *
 * 行为：确认 → 先 `validateFields`（失败则字段内联标红、保持打开、不提交）→ 调 `onSubmit`；成功自动
 * `resetFields` + 关闭，失败保持打开由 `errorNode` 回显。固定语义（不读品牌运行期变量，守 D3 不换肤）。
 */
export function CrudDrawerForm<TValues = Record<string, unknown>>({
  open,
  onOpenChange,
  title,
  onSubmit,
  submitting = false,
  errorNode,
  submitText,
  cancelText,
  width = 480,
  form: formProp,
  onReset,
  children,
}: CrudDrawerFormProps<TValues>) {
  const [innerForm] = Form.useForm<TValues>();
  const form = formProp ?? innerForm;
  // 同步 in-flight 标志：`submitting` 是异步 state，在 validateFields 之后才置真，留有亚毫秒微窗；
  // ref 在 handleOk 入口（await 之前）同步置真，彻底杜绝并发提交（本范式将被三模块复制，故收紧到位）。
  const inFlight = useRef(false);

  // 关闭/成功后统一复位：清表单字段（避免脏值回显）+ 经 onReset 清 hook 错误态（避免旧 Alert 残留到重开）。
  const resetAll = () => {
    form.resetFields();
    onReset?.();
  };

  const close = () => {
    resetAll();
    onOpenChange(false);
  };

  const handleClose = () => {
    if (submitting) return; // 提交中不允许取消/关闭，避免半提交态
    close();
  };

  const handleOk = async () => {
    if (inFlight.current) return; // 同步防重入：validateFields/onSubmit 异步在途期间，二次点击直接拒绝
    inFlight.current = true;
    try {
      let values: TValues;
      try {
        values = await form.validateFields();
      } catch {
        return; // 校验失败：antd 已在字段内联标红，保持抽屉打开
      }
      const ok = await onSubmit(values);
      if (ok) close();
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <Drawer
      title={title}
      open={open}
      onClose={handleClose}
      width={width}
      maskClosable={!submitting}
      destroyOnHidden
      footer={
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} disabled={submitting}>
            {cancelText}
          </Button>
          <Button type="primary" loading={submitting} onClick={handleOk}>
            {submitText}
          </Button>
        </Space>
      }
    >
      {errorNode}
      <Form form={form} layout="vertical" preserve={false}>
        {children}
      </Form>
    </Drawer>
  );
}
