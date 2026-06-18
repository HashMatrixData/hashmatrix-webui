import axios, { type AxiosError, type AxiosInstance } from 'axios';
import { getRuntimeConfig } from '@hashmatrix/brand';
import { getAccessToken } from './authToken';

/**
 * 租户头（多租户网关路由用）。
 * TODO(脚手架占位)：真实多租户应由会话/令牌 claim 或运行期配置派生当前租户，
 * 而非硬编码默认；与字段级/行级权限同属后续专项（spec §7）。当前用脱敏占位 tenant-demo。
 */
const TENANT_HEADER = 'X-Tenant-Id';
const DEFAULT_TENANT = 'tenant-demo';

export interface ApiError {
  status: number;
  message: string;
}

function createHttp(): AxiosInstance {
  const baseURL = getRuntimeConfig().api?.baseUrl ?? '/api';
  const instance = axios.create({ baseURL, timeout: 15000 });

  // 请求拦截：统一注入鉴权头 + 租户头。
  instance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
    if (!config.headers.has(TENANT_HEADER)) config.headers.set(TENANT_HEADER, DEFAULT_TENANT);
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
