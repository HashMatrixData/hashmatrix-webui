/// <reference types="vite/client" />

import type { RuntimeConfig } from '@hashmatrix/brand';

declare global {
  interface Window {
    /** 运行期注入配置（public/config.js）。部署期由容器 env 渲染。 */
    __CONFIG__?: RuntimeConfig;
  }
}

export {};
