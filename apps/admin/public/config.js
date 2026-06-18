/**
 * 运营控制台（管理平面）运行期注入配置。部署期由 Nginx 容器 env 渲染覆盖。
 *
 * 品牌为**部署级**（SaaS=我们品牌 / 私有化=客户品牌），与 console 同一套白标引擎，**不按租户换肤**。
 * admin 对接 control-plane；OIDC 切到**跨租户 superadmin 角色**（不绑 org）。
 * 红线：示例值一律脱敏占位（example.com / tenant-demo），禁止任何真实甲方信息。
 */
window.__CONFIG__ = {
  brand: {
    // 留空则用构建期默认品牌；部署级覆盖示例：
    // appName: 'Acme 运营台',
    // companyName: 'Acme Demo Tech',
  },
  api: {
    // 管理平面对接 control-plane（经网关）。
    baseUrl: '/control-plane',
  },
  oidc: {
    // authority 留空 → 开发期回落 mock（superadmin）；填入即激活真实 Keycloak OIDC。
    // 管理平面使用独立 client + 跨租户 superadmin 角色映射。示例：
    // authority: 'https://auth.example.com/realms/ops',
    authority: '',
    clientId: 'hashmatrix-admin',
    scope: 'openid profile email',
  },
};
