import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Select } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSession, isOidcEnabled, useMockSessionStore } from '@hashmatrix/sdk';
import { listMyTenants } from '@/api/controlPlane';

/**
 * 顶栏租户切换器（M1 占位）。取数 `GET /v1/me/tenants`（D1：当前用户 membership，先 1 个，结构按多租户），
 * 当前值取自会话租户（#10）。切换走 **D2 语义**：租户切换 = 重新换取该 org 的 token，`X-Tenant-Id` 始终唯一。
 * - mock 会话：直接换 seed（`setTenant`——#10 为本组件预备的结构）；`X-Tenant-Id` 经 sdk 拦截器即时跟随，
 *   并失效服务端状态缓存，令下游按新租户重取（D2 语义占位）。
 * - 真实 OIDC：应触发 Keycloak org-scoped 重新换 token（organization / acr 参数）——M1 留语义占位，
 *   随 D6 后置身份接入落地（前端不自造 token）。
 * 跨租户 superadmin（admin 平面，tenant=null）不在本组件范围；无活动租户则不渲染。
 */
export function TenantSwitcher() {
  const { t } = useTranslation();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { data: memberships = [] } = useQuery({
    queryKey: ['me', 'tenants'],
    queryFn: listMyTenants,
  });

  const current = user?.tenant ?? null;
  if (!current) return null; // 无活动租户（跨租户 / 未登录）——不渲染切换器

  // 选项以 membership 列表为准；当前租户兜底入列（查询未就绪 / tolerant），避免选中值无对应项。
  const options = memberships.map((m) => ({ value: m.tenantId, label: m.displayName }));
  if (!options.some((o) => o.value === current)) {
    options.unshift({ value: current, label: current });
  }

  const handleChange = (tenantId: string) => {
    if (tenantId === current) return;
    if (!isOidcEnabled()) {
      // mock：换 seed → `X-Tenant-Id` 跟随；失效缓存令下游按新租户重取（D2 语义占位）。
      useMockSessionStore.getState().setTenant(tenantId);
      void queryClient.invalidateQueries();
    }
    // 真实 OIDC：D2 重换 token 占位（见组件注释）。
  };

  return (
    <Select
      aria-label={t('tenant.label')}
      value={current}
      onChange={handleChange}
      options={options}
      suffixIcon={<ApartmentOutlined />}
      style={{ minWidth: 150 }}
    />
  );
}
