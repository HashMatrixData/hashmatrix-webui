import axios, { type AxiosError, type AxiosInstance } from 'axios';
import { getRuntimeConfig } from '@hashmatrix/brand';
import { getAccessToken } from './authToken';
import { getCurrentTenant } from './tenantContext';

/**
 * 租户头（多租户网关路由用）。D2：租户取自会话（OIDC token `tenant` 声明 / mock seed），
 * 经 setTenantProvider 注入，**非硬编码**。无会话租户（admin 跨租户 / 未登录）则不附此头——
 * 不伪造默认租户。切换租户=重换 token，故每请求至多一个 X-Tenant-Id 且唯一来自会话。
 * 注：生产经 APISIX 网关时，权威 X-Tenant-* 由网关基于已验签 token 服务端注入；本头为无网关
 * 直连 / 本地 mock 的兜底来源，网关存在时以网关为准（跨层策略落档见主仓 architecture 05）。
 */
const TENANT_HEADER = 'X-Tenant-Id';

export interface ApiError {
  status: number;
  message: string;
}

function createHttp(): AxiosInstance {
  const baseURL = getRuntimeConfig().api?.baseUrl ?? '/api';
  const instance = axios.create({ baseURL, timeout: 15000 });

  // 请求拦截：统一注入鉴权头 + 会话派生租户头。
  instance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
    const tenant = getCurrentTenant();
    if (tenant && !config.headers.has(TENANT_HEADER)) config.headers.set(TENANT_HEADER, tenant);
    return config;
  });

  // 响应拦截：统一错误归一化（业务侧拿到稳定 ApiError）。
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string }>) => {
      const apiError: ApiError = {
        status: error.response?.status ?? 0,
        message: error.response?.data?.message ?? error.message ?? 'Network Error',
      };
      return Promise.reject(apiError);
    },
  );

  return instance;
}

export const http = createHttp();
