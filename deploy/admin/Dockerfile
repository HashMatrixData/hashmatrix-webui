# syntax=docker/dockerfile:1
# 管理平面（apps/admin）独立构建产物 / 独立镜像 / 独立域名——与 console bundle 互不可达（安全爆炸半径隔离）。
# 构建上下文为仓库根（services/webui）。

# ---- build ----
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @hashmatrix/admin build

# ---- runtime ----
FROM nginx:1.27-alpine AS runtime
# 信创：资源全部自托管，运行期不依赖公网 CDN。
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html
# 运行期 config.js 模板 + 渲染脚本（control-plane API + superadmin OIDC，品牌部署级）。
COPY deploy/admin/config.js.template /opt/config.js.template
COPY deploy/admin/30-render-config.sh /docker-entrypoint.d/30-render-config.sh
RUN chmod +x /docker-entrypoint.d/30-render-config.sh

EXPOSE 80
