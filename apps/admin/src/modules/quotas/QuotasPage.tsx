import { Alert, Card, Table, Typography, type TableColumnsType } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { listTenants } from '@/api/controlPlane';
import type { Tenant } from '@/api/types';

/**
 * 配额查看（control-plane mock）。
 * 契约 v1.2.0 / B：M1 **仅展示配额限额**——`usage`（用量条）与 `GET /quota`、配额写入端点均未落地，
 * 故无用量进度条、无在线调整入口；配额额度（QuotaSpec）取自租户目录条目 `Tenant.quota`。
 */
export function QuotasPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tenants', 'quotas'],
    queryFn: () => listTenants({ pageSize: 200 }),
  });
  // 仅展示已分配配额且未注销的租户。
  const rows = (data?.items ?? []).filter((tn) => tn.quota && tn.status !== 'deleted');
  const num = (v?: number) => (typeof v === 'number' ? String(v) : t('tenant.none'));

  const columns: TableColumnsType<Tenant> = [
    { title: t('quota.colTenant'), dataIndex: 'tenantId', width: 180 },
    { title: t('quota.maxUsers'), width: 140, render: (_, row) => num(row.quota?.maxUsers) },
    { title: t('quota.maxStorage'), width: 160, render: (_, row) => num(row.quota?.maxStorageGi) },
    { title: t('quota.maxJobs'), width: 150, render: (_, row) => num(row.quota?.maxConcurrentJobs) },
    { title: t('quota.cpu'), width: 120, render: (_, row) => num(row.quota?.compute?.cpuCores) },
    { title: t('quota.mem'), width: 130, render: (_, row) => num(row.quota?.compute?.memoryGi) },
  ];

  return (
    <Card title={t('quota.title')}>
      <Typography.Paragraph type="secondary">{t('quota.intro')}</Typography.Paragraph>
      {isError && (
        <Alert type="error" showIcon banner role="alert" style={{ marginBottom: 16 }} message={t('common.loadError')} />
      )}
      <Table<Tenant>
        rowKey="tenantId"
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        pagination={false}
        locale={{ emptyText: t('quota.empty') }}
      />
    </Card>
  );
}
