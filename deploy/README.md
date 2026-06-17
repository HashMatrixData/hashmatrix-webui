# 部署（deploy/）

静态产物 → Nginx 容器；运行期 `config.js` 注入（改 env 重启即生效，免重建）。

## 构建镜像（构建上下文为仓库根）

```bash
docker build -f deploy/Dockerfile -t hashmatrix-webui:local .
```

## 运行（通过 env 注入品牌 / 接入参数）

```bash
docker run --rm -p 8080:80 \
  -e BRAND_APP_NAME="Acme 数据中台" \
  -e BRAND_COMPANY_NAME="Acme Demo Tech" \
  -e BRAND_COLOR_PRIMARY="#722ed1" \
  -e BRAND_COLOR_SECONDARY="#eb2f96" \
  -e API_BASE_URL="/api" \
  -e OIDC_AUTHORITY="https://auth.example.com/realms/tenant-demo" \
  -e OIDC_CLIENT_ID="hashmatrix-webui" \
  hashmatrix-webui:local
```

容器启动时 `30-render-config.sh` 用 `envsubst` 渲染 `config.js.template` → `/usr/share/nginx/html/config.js`。

## 文件

| 文件 | 作用 |
|------|------|
| `Dockerfile` | 多阶段构建（pnpm 构建 → nginx 托管） |
| `nginx.conf` | SPA 回退、`config.js` 不缓存、`/assets` 强缓存、安全头、gzip |
| `config.js.template` | 运行期配置模板（envsubst 变量） |
| `30-render-config.sh` | 启动钩子：env → `config.js` |

> 红线：模板默认值与示例命令均脱敏占位（example.com / tenant-demo），禁止写入任何真实甲方参数。
