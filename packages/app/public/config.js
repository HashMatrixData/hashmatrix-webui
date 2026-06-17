/**
 * 运行期注入配置（window.__CONFIG__）—— 部署期由 Nginx 容器 env 渲染覆盖（见 deploy/config.js.template）。
 *
 * 白标换肤：改本文件 brand 字段并刷新即生效，**无需重新构建**。
 * 缺省字段回落到构建期默认（src/brand/brand.default.json / 环境默认）。
 *
 * 红线：示例值一律脱敏占位（example.com / acme / tenant-demo），禁止任何真实甲方信息。
 */
window.__CONFIG__ = {
  brand: {
    // 留空则使用构建期默认品牌；下方为运行期覆盖示例：
    // appName: 'Acme 数据中台',
    // companyName: 'Acme Demo Tech',
    // colorPrimary: '#1668dc',
    // colorSecondary: '#13c2c2',
  },
  api: {
    baseUrl: '/api',
  },
  oidc: {
    // authority 留空 → 开发期回落 mock 会话；填入即激活真实 Keycloak OIDC。
    // 生产部署由容器 env 注入（见 deploy/config.js.template）。示例：
    // authority: 'https://auth.example.com/realms/tenant-demo',
    authority: '',
    clientId: 'hashmatrix-webui',
    scope: 'openid profile email',
  },
};
