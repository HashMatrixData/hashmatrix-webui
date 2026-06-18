import { Card, Progress, Table, Tag, type TableColumnsType } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { listProvisionJobs } from '@/api/controlPlane';
import type { ProvisionJob, ProvisionStatus } from '@/api/types';

// 状态语义色固定（与画布主题决策一致：状态色不随品牌）。
const STATUS: Record<
  ProvisionStatus,
  { color: string; key: 'provision.running' | 'provision.succeeded' | 'provision.failed' }
> = {
  running: { color: 'processing', key: 'provision.running' },
  succeeded: { color: 'success', key: 'provision.succeeded' },
  failed: { color: 'error', key: 'provision.failed' },
};

/** 开通状态：provision 进度 / 结果（control-plane mock）。 */
export function ProvisioningPage() {
  const { t } = useTranslation();
  const { data = [], isLoading } = useQuery({ queryKey: ['provision-jobs'], queryFn: listProvisionJobs });

  const columns: TableColumnsType<ProvisionJob> = [
    { title: t('provision.colTenant'), dataIndex: 'tenantName' },
    { title: t('provision.colStep'), dataIndex: 'step' },
    {
      title: t('provision.colProgress'),
      dataIndex: 'progress',
      width: 220,
      render: (p: number, row) => (
        <Progress percent={p} size="small" status={row.status === 'failed' ? 'exception' : row.status === 'succeeded' ? 'success' : 'active'} />
      ),
    },
    {
      title: t('provision.colResult'),
      dataIndex: 'status',
      width: 120,
      render: (s: ProvisionStatus) => <Tag color={STATUS[s].color}>{t(STATUS[s].key)}</Tag>,
    },
  ];

  return (
    <Card title={t('provision.title')}>
      <Table<ProvisionJob> rowKey="tenantId" loading={isLoading} columns={columns} dataSource={data} pagination={false} />
    </Card>
  );
}
