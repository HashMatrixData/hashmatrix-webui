// SDK：API 客户端/请求封装 + 鉴权与权限原语（Session 抽象 / OIDC / 路由·按钮守卫）。两 app 共享。
export * from './auth';
export { MockSessionProvider } from './auth/MockSessionProvider';
export * from './api';
