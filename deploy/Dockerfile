# syntax=docker/dockerfile:1
# 多阶段：pnpm 构建静态产物 → Nginx 容器托管（spec 部署：静态产物 → Nginx，运行期 config.js 注入）。
# 构建上下文为仓库根（services/webui）。

# ---- build ----
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /app

# 仅复制清单以最大化依赖层缓存。
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/app/package.json packages/app/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---- runtime ----
FROM nginx:1.27-alpine AS runtime
# 信创：资源全部自托管，运行期不依赖公网 CDN。
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/app/dist /usr/share/nginx/html
# 运行期 config.js 模板 + 渲染脚本（容器启动由 env 渲染，免重建换肤）。
COPY deploy/config.js.template /opt/config.js.template
COPY deploy/30-render-config.sh /docker-entrypoint.d/30-render-config.sh
RUN chmod +x /docker-entrypoint.d/30-render-config.sh

EXPOSE 80
