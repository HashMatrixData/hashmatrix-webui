# 部署（deploy/）

**同仓双 app，每 app 一套独立镜像 / 独立域名**（bundle 互不可达，安全爆炸半径隔离）。
静态产物 → Nginx 容器；运行期 `config.js` 注入（改 env 重启即生效，免重建）。

```
deploy/
├─ nginx.conf            # 两 app 共享：SPA 回退 / config.js 不缓存 / /assets 强缓存 / 安全头 / gzip
├─ console/              # 使用平面（apps/console）
│  ├─ Dockerfile         # 多阶段：pnpm 构建 console → nginx 托管
│  ├─ config.js.template # 运行期配置模板（brand/api/oidc，envsubst 变量）
│  └─ 30-render-config.sh# 启动钩子：env → config.js（默认 /api · hashmatrix-webui）
└─ admin/                # 管理平面（apps/admin）
   ├─ Dockerfile         # 多阶段：pnpm 构建 admin → nginx 托管
   ├─ config.js.template
   └─ 30-render-config.sh# 默认 /control-plane · hashmatrix-admin（superadmin OIDC）
```

## 构建镜像（构建上下文为仓库根）

```bash
docker build -f deploy/console/Dockerfile -t hashmatrix-console:local .
docker build -f deploy/admin/Dockerfile   -t hashmatrix-admin:local .
```

## 运行（通过 env 注入品牌 / 接入参数）

```bash
# 使用平面 · 租户控制台
docker run --rm -p 8080:80 \
  -e BRAND_APP_NAME="Acme 数据中台" \
  -e API_BASE_URL="/api" \
  -e OIDC_AUTHORITY="https://auth.example.com/realms/tenant-demo" \
  -e OIDC_CLIENT_ID="hashmatrix-webui" \
  hashmatrix-console:local

# 管理平面 · 运营控制台（跨租户 superadmin · 对接 control-plane · 独立域名）
docker run --rm -p 8081:80 \
  -e BRAND_APP_NAME="Acme 运营台" \
  -e API_BASE_URL="/control-plane" \
  -e OIDC_AUTHORITY="https://auth.example.com/realms/ops" \
  -e OIDC_CLIENT_ID="hashmatrix-admin" \
  hashmatrix-admin:local
```

容器启动时各自的 `30-render-config.sh` 用 `envsubst` 渲染 `config.js.template` → `/usr/share/nginx/html/config.js`。

> 品牌为**部署级**（SaaS=我们品牌 / 私有化=客户品牌），两 app 同源、**不按租户运行期换肤**。
> 🔴 红线：模板默认值与示例命令均脱敏占位（example.com / tenant-demo），禁止写入任何真实甲方参数。

## 接真实后端（反向代理）

当前 `nginx.conf` 仅做 SPA 回退（前端为 msw mock 自含）。接真实后端时，需在各 app 的 nginx 增加 API 反代，否则 `config.js` 的 `api.baseUrl` 路径会落到 SPA 回退返回 HTML：

```nginx
# console：location /api/      { proxy_pass http://<gateway>/; }
# admin：  location /control-plane/ { proxy_pass http://<control-plane-or-gateway>/; }
```
