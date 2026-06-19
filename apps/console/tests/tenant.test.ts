import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { extractTenant, getCurrentTenant, http, setTenantProvider } from '@hashmatrix/sdk';

/**
 * #10 · 会话承载租户声明 + X-Tenant-Id 派生（D1/D2）。
 * 覆盖：①从 JWT `tenant` 声明提取租户 ②http 拦截器贴会话派生头 ③无租户兜底=不发头。
 */

type ExtractTenantArg = Parameters<typeof extractTenant>[0];

/** 构造仅含 payload 的伪 JWT（base64url，ASCII 声明；不校验签名，与生产解码路径一致）。 */
function fakeAccessToken(payload: Record<string, unknown>): string {
  const b64url = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${b64url({ alg: 'none', typ: 'JWT' })}.${b64url(payload)}.sig`;
}

const userWith = (payload: Record<string, unknown>): ExtractTenantArg =>
  ({ access_token: fakeAccessToken(payload) }) as unknown as ExtractTenantArg;

describe('extractTenant — 从 JWT 提取租户声明', () => {
  it('读取 access_token 的 `tenant` 声明（org=租户）', () => {
    expect(extractTenant(userWith({ tenant: 'acme' }))).toEqual({ tenant: 'acme' });
  });

  it('缺 `tenant` 时回落 `tenants[0]`，并保留全集（D1 多 org membership）', () => {
    expect(extractTenant(userWith({ tenants: ['acme', 'globex'] }))).toEqual({
      tenant: 'acme',
      tenants: ['acme', 'globex'],
    });
  });

  it('无 token / 无声明 → tenant 为 null（→ 不派生 X-Tenant-Id）', () => {
    expect(extractTenant(null).tenant).toBeNull();
    expect(extractTenant(userWith({ name: 'Demo User' })).tenant).toBeNull();
  });
});

describe('http 拦截器 — X-Tenant-Id 由会话派生（D2）', () => {
  // 桩 adapter：回显经拦截器处理后的 config，免真实网络。`http` 是 @hashmatrix/sdk 导出的共享单例，
  // 故仅在本块期间替换其 adapter，afterAll 必须还原，避免污染同进程其他测试（取数组件假绿）。
  type Adapter = NonNullable<typeof http.defaults.adapter>;
  let realAdapter: Adapter | undefined;
  beforeAll(() => {
    realAdapter = http.defaults.adapter;
    http.defaults.adapter = (async (config: unknown) => ({
      data: null,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    })) as unknown as Adapter;
  });
  afterAll(() => {
    http.defaults.adapter = realAdapter; // 还原真实 adapter，杜绝跨文件泄漏
  });
  afterEach(() => {
    setTenantProvider(() => undefined); // 复位为默认，避免跨用例泄漏
  });

  it('provider 有租户时，恰附一个会话派生的 X-Tenant-Id', async () => {
    setTenantProvider(() => 'acme');
    expect(getCurrentTenant()).toBe('acme');
    const res = await http.get('/ping');
    expect(res.config.headers.get('X-Tenant-Id')).toBe('acme');
  });

  it('无会话租户时不附 X-Tenant-Id（兜底=不发头，不伪造默认）', async () => {
    setTenantProvider(() => undefined);
    const res = await http.get('/ping');
    expect(res.config.headers.has('X-Tenant-Id')).toBe(false);
  });
});
