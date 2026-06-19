import { Tag } from 'antd';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import type { TenantStatus } from '@/api/types';

/**
 * 租户状态 → 语义色 + i18n 标签。tolerant reader：对未知状态（服务端将来新增）降级为「未知」，不报错。
 * 状态色为语义固定（不随品牌换肤），与画布主题决策一致。
 */
const META: Record<TenantStatus, { color: string; key: ParseKeys }> = {
  registered: { color: 'default', key: 'tenant.statusRegistered' },
  approving: { color: 'processing', key: 'tenant.statusApproving' },
  provisioning: { color: 'processing', key: 'tenant.statusProvisioning' },
  active: { color: 'success', key: 'tenant.statusActive' },
  suspended: { color: 'warning', key: 'tenant.statusSuspended' },
  deleted: { color: 'error', key: 'tenant.statusDeleted' },
};

function tenantStatusMeta(status: string): { color: string; key: ParseKeys } {
  return (
    (META as Record<string, { color: string; key: ParseKeys }>)[status] ?? {
      color: 'default',
      key: 'tenant.statusUnknown',
    }
  );
}

export function TenantStatusTag({ status }: { status: TenantStatus }) {
  const { t } = useTranslation();
  const meta = tenantStatusMeta(status);
  return <Tag color={meta.color}>{t(meta.key)}</Tag>;
}
