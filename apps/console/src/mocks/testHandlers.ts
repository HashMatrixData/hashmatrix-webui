import { http, HttpResponse, delay } from 'msw';

/**
 * 测试态 msw 工具（console 列表响应形 `{ data, total, success }`）。
 * 供 story 经 `parameters.msw.handlers` **逐 story 覆盖**全局 handler，造空 / 错 / 慢态。
 * 慢态延迟有限（默认 1.5s）后必 resolve——否则 test-runner 的 `networkidle` 永不就绪而挂起（流水线安全）。
 */
export const emptyList = (path: string) =>
  http.get(path, () => HttpResponse.json({ data: [], total: 0, success: true }));

export const errorList = (path: string, status = 500) =>
  http.get(path, () => HttpResponse.json({ message: 'mock load error' }, { status }));

export const slowList = (path: string, ms = 1500) =>
  http.get(path, async () => {
    await delay(ms);
    return HttpResponse.json({ data: [], total: 0, success: true });
  });
