import { useState, type ReactNode } from 'react';
import { Alert } from 'antd';

export interface Paged<T> {
  data: T[];
  total: number;
}

export interface UseTableRequestResult<T> {
  /** 传给 ProTable 的 `request`：成功透传分页结果；失败时**不抛**，降级为空表并置错误态。 */
  request: (params: Record<string, unknown>) => Promise<{ data: T[]; total: number; success: boolean }>;
  /** 失败时渲染的内联错误 Alert（应挂在表格上方）；无错误为 `null`。 */
  errorNode: ReactNode;
}

/**
 * ProTable 取数 + 统一错误态（两 app 共享 · D：共享靠 packages/* 不靠复制）。
 *
 * 包装一个 `fetcher`（通常 `http.get(...).then(r => r.data)`）为 ProTable 的 `request`：
 * - 成功：透传 `{ data, total, success:true }`。
 * - 失败：吞掉异常、返回空表（`success:false`），并把 `errorNode` 置为一条**内联** `Alert`。
 *
 * 为何内联 Alert 而非 toast：消息类组件 portal 到 `document.body`，落在 story 画布（`canvasElement`）之外，
 * test-runner 的 `within(canvasElement)` 断言不到；内联 Alert 渲染在画布内、持久、可稳定断言，且与「空数据」
 * 态可区分。`errorText` 由调用方传入（各 app 自有 i18n，本 hook 不耦合 i18n）。
 */
export function useTableRequest<T>(
  fetcher: (params: Record<string, unknown>) => Promise<Paged<T>>,
  errorText: string,
): UseTableRequestResult<T> {
  const [failed, setFailed] = useState(false);

  const request = async (params: Record<string, unknown>) => {
    try {
      const { data, total } = await fetcher(params);
      setFailed(false);
      return { data, total, success: true };
    } catch (err) {
      // 吞掉异常以降级为空表 + 错误 Alert，但仍记录细节——否则真后端接入期失败不可诊断（仅剩通用文案）。
      console.error('[useTableRequest] 列表取数失败', err);
      setFailed(true);
      return { data: [], total: 0, success: false };
    }
  };

  const errorNode = failed ? (
    <Alert type="error" showIcon banner role="alert" message={errorText} style={{ marginBottom: 16 }} />
  ) : null;

  return { request, errorNode };
}
