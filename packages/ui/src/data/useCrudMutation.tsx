import { useState, type ReactNode } from 'react';
import { Alert } from 'antd';

export interface UseCrudMutationOptions {
  /**
   * 提交成功后回调——由调用方在此 **invalidate / reload**（app 持有 TanStack Query 的 `queryClient`
   * 或 ProTable 的 `actionRef`；本 hook 与 useTableRequest 同哲学，不引 react-query、不耦合取数实现）。
   */
  onSuccess?: () => void;
  /** 提交失败时内联 Alert 的文案（各 app 自有 i18n，本 hook 不耦合 i18n——与 useTableRequest 一致）。 */
  errorText: string;
}

export interface UseCrudMutationResult<TValues> {
  /** 执行提交：成功返回 `true`（调用方据此关抽屉/重置）；失败**不抛**，吞异常、置错误态、返回 `false`。 */
  submit: (values: TValues) => Promise<boolean>;
  /** 提交进行中——驱动按钮 loading、防重复提交。 */
  submitting: boolean;
  /** 失败时渲染的内联错误 Alert（应挂在表单顶部）；无错误为 `null`。 */
  errorNode: ReactNode;
  /** 清除错误态——调用方应在抽屉关闭/重开时调用，避免上一次的失败 Alert 残留到下一次打开。 */
  reset: () => void;
}

/**
 * CRUD 写侧范式：提交态 + 统一错误态（两 app 共享 · D：共享靠 packages/* 不靠复制）。
 *
 * 读侧有 {@link useTableRequest}，本 hook 补写侧，**刻意与其同构**：
 * - 不引 `@tanstack/react-query`：保持 `@hashmatrix/ui` antd-only 的依赖面；「成功后 invalidate/reload」
 *   由调用方经 {@link UseCrudMutationOptions.onSuccess} 注入（app 才持有 queryClient / actionRef）。
 * - 失败**不抛**：吞异常降级为 `errorNode` 内联 `Alert`（非 toast——message 类组件 portal 到 body、
 *   落在 story 画布外，test-runner 的 `within(canvasElement)` 断不到；内联 Alert 渲染在表单内、可稳定断言）。
 * - `errorText` 由调用方传入，本 hook 不耦合 i18n。
 *
 * 典型用法（消费方在 app 内）：
 * ```tsx
 * const { submit, submitting, errorNode } = useCrudMutation(
 *   (v) => http.post('/api/datasources', v),
 *   { errorText: t('common.submitError'), onSuccess: () => actionRef.current?.reload() },
 * );
 * ```
 */
export function useCrudMutation<TValues, TResult = unknown>(
  submitter: (values: TValues) => Promise<TResult>,
  options: UseCrudMutationOptions,
): UseCrudMutationResult<TValues> {
  const { onSuccess, errorText } = options;
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);

  const submit = async (values: TValues): Promise<boolean> => {
    setSubmitting(true);
    let succeeded = false;
    try {
      await submitter(values);
      succeeded = true;
      setFailed(false);
    } catch (err) {
      // 吞掉异常以降级为错误 Alert（不阻断 UI），但仍记录细节——否则真后端接入期失败仅剩通用文案、不可诊断。
      // 注（D7）：此处记录的 `err` 须为已归一化的错误（sdk 响应拦截器产出 `{status,message}`，不含请求体），
      // 故敏感载荷（如数据源 password）不会随日志外泄；若改为记录 axios 原始 error，务必先剥离 config.data。
      console.error('[useCrudMutation] 提交失败', err);
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
    // onSuccess 在 try 之外、仅成功分支调用：写入既已成功，回调（如 reload）抛错不应回退为「提交失败」，
    // 否则 UI 误报失败、用户重复提交 → 重复落库。回调自身的错误单独吞掉记录。
    if (succeeded) {
      try {
        onSuccess?.();
      } catch (err) {
        console.error('[useCrudMutation] onSuccess 回调出错（提交本身已成功）', err);
      }
      return true;
    }
    return false;
  };

  const reset = () => setFailed(false);

  const errorNode = failed ? (
    <Alert type="error" showIcon banner role="alert" message={errorText} style={{ marginBottom: 16 }} />
  ) : null;

  return { submit, submitting, errorNode, reset };
}
