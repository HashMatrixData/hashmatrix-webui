#!/bin/sh
# 管理平面容器启动钩子：用环境变量渲染运行期 config.js。
# 默认对接 control-plane、superadmin OIDC client；品牌部署级（与 console 同源）。
set -eu

: "${BRAND_APP_NAME:=HashMatrix Ops}"
: "${BRAND_COMPANY_NAME:=Acme Demo Tech}"
: "${BRAND_COLOR_PRIMARY:=#1668dc}"
: "${BRAND_COLOR_SECONDARY:=#13c2c2}"
: "${API_BASE_URL:=/control-plane}"
: "${OIDC_AUTHORITY:=}"
: "${OIDC_CLIENT_ID:=hashmatrix-admin}"
: "${OIDC_SCOPE:=openid profile email}"

export BRAND_APP_NAME BRAND_COMPANY_NAME BRAND_COLOR_PRIMARY BRAND_COLOR_SECONDARY \
  API_BASE_URL OIDC_AUTHORITY OIDC_CLIENT_ID OIDC_SCOPE

envsubst < /opt/config.js.template > /usr/share/nginx/html/config.js
echo "[entrypoint] rendered admin /usr/share/nginx/html/config.js (appName=${BRAND_APP_NAME}, api=${API_BASE_URL})"
