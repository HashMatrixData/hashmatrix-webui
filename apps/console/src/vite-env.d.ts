/// <reference types="vite/client" />

import type { RuntimeConfig } from '@hashmatrix/brand';

declare global {
  interface Window {
    /** 运行期注入配置（public/config.js）。部署期由容器 env 渲染。 */
    __CONFIG__?: RuntimeConfig;
  }

  interface ImportMetaEnv {
    /** 置 'off' 关闭开发态 msw mock（接真实后端/网关联调时用，如 M1 I3/I4 纵切链）。 */
    readonly VITE_MSW?: string;
  }
}

export {};
