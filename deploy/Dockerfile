# syntax=docker/dockerfile:1
# 多阶段：pnpm 构建静态产物 → Nginx 容器托管（spec 部署：静态产物 → Nginx，运行期 config.js 注入）。
# 构建上下文为仓库根（services/webui）。

# ---- build ----
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app

# 单体多包，整体复制后安装（.dockerignore 已排除 node_modules/dist 等）。
COPY . .
RUN pnpm install --frozen-lockfile
# 仅构建 console app（admin 由 PR-B 增加独立 Dockerfile）。
RUN pnpm --filter @hashmatrix/console build

# ---- runtime ----
FROM nginx:1.27-alpine AS runtime
# 信创：资源全部自托管，运行期不依赖公网 CDN。
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/console/dist /usr/share/nginx/html
# 运行期 config.js 模板 + 渲染脚本（容器启动由 env 渲染，免重建换肤）。
COPY deploy/config.js.template /opt/config.js.template
COPY deploy/30-render-config.sh /docker-entrypoint.d/30-render-config.sh
RUN chmod +x /docker-entrypoint.d/30-render-config.sh

EXPOSE 80
