/**
 * 白标引擎类型（品牌层）。详见 docs/00-前端初始化-spec.md §4。
 *
 * 单一品牌配置源 → 四路分发：AntD token / CSS Vars / i18n 品牌串 / 资源槽位。
 * v1 仅做品牌层；架构预留升级到全 design token。
 */

/** Logo / favicon 资源槽位（指向 public/brand/ 下自托管资源，信创离线友好）。 */
export interface BrandAssets {
  /** 亮色主题 logo */
  light: string;
  /** 暗色主题 logo */
  dark: string;
  /** 浏览器页签 favicon */
  favicon: string;
}

/** 品牌配置（白标层）。可被运行期 config.js 整体或部分覆盖。 */
export interface BrandConfig {
  /** 品牌名（产品名），用于标题/导航/i18n 品牌串 */
  appName: string;
  /** 企业名（版权方），用于页脚/关于 */
  companyName: string;
  /** Logo / favicon 槽位 */
  logo: BrandAssets;
  /** 主色：分发到 AntD token.colorPrimary + 全量组件换肤 */
  colorPrimary: string;
  /** 辅色 / 强调色：分发到 CSS var，供画布强调色与自研组件消费 */
  colorSecondary: string;
  /** 预留：客户自备商用字体槽位（默认空 → 走系统中文字体栈） */
  fontFamily?: string;
}

/** OIDC（Keycloak）运行期参数，部署期由 config.js 注入。 */
export interface OidcRuntimeConfig {
  authority: string;
  clientId: string;
  redirectUri?: string;
  postLogoutRedirectUri?: string;
  scope?: string;
}

/** API 网关运行期参数。 */
export interface ApiRuntimeConfig {
  baseUrl: string;
}

/**
 * 运行期注入配置（window.__CONFIG__）。
 * 构建期产出 public/config.js 默认值；部署期容器 env 渲染覆盖。
 * 所有字段可选——缺省回落到构建期默认（brand.default.json / 环境默认）。
 */
export interface RuntimeConfig {
  brand?: Partial<BrandConfig>;
  api?: Partial<ApiRuntimeConfig>;
  oidc?: Partial<OidcRuntimeConfig>;
}
