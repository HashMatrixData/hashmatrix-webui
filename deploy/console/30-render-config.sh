#!/bin/sh
# 容器启动钩子（nginx 官方镜像执行 /docker-entrypoint.d/*.sh）：
# 用环境变量渲染运行期 config.js。改 env 重启即换肤/换接入参数，免重建镜像。
set -eu

: "${BRAND_APP_NAME:=HashMatrix}"
: "${BRAND_COMPANY_NAME:=Acme Demo Tech}"
: "${BRAND_COLOR_PRIMARY:=#1668dc}"
: "${BRAND_COLOR_SECONDARY:=#13c2c2}"
: "${API_BASE_URL:=/api}"
: "${OIDC_AUTHORITY:=}"
: "${OIDC_CLIENT_ID:=hashmatrix-webui}"
: "${OIDC_SCOPE:=openid profile email}"

export BRAND_APP_NAME BRAND_COMPANY_NAME BRAND_COLOR_PRIMARY BRAND_COLOR_SECONDARY \
  API_BASE_URL OIDC_AUTHORITY OIDC_CLIENT_ID OIDC_SCOPE

envsubst < /opt/config.js.template > /usr/share/nginx/html/config.js
echo "[entrypoint] rendered /usr/share/nginx/html/config.js (appName=${BRAND_APP_NAME})"
