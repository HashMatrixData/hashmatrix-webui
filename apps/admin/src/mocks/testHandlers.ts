import { http, HttpResponse, delay } from 'msw';

/**
 * 测试态 msw 工具（admin/control-plane 列表响应形 `{ items, page, pageSize, total }`，对齐契约 v1.2.0）。
 * 供 story 经 `parameters.msw.handlers` **逐 story 覆盖**全局 handler，造空 / 错 / 慢态。
 * 慢态延迟有限（默认 1.5s）后必 resolve——否则 test-runner 的 `networkidle` 永不就绪而挂起（流水线安全）。
 */
export const emptyList = (path: string) =>
  http.get(path, () => HttpResponse.json({ items: [], page: 1, pageSize: 20, total: 0 }));

export const errorList = (path: string, status = 500) =>
  http.get(path, () => HttpResponse.json({ code: 'MOCK_ERROR', message: 'mock load error' }, { status }));

export const slowList = (path: string, ms = 1500) =>
  http.get(path, async () => {
    await delay(ms);
    return HttpResponse.json({ items: [], page: 1, pageSize: 20, total: 0 });
  });
