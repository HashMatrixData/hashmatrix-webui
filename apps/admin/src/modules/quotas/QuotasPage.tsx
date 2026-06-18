import { ModalForm, ProFormDigit } from '@ant-design/pro-components';
import { App, Button, Card, Progress, Table, type TableColumnsType } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { listQuotas, updateQuota } from '@/api/controlPlane';
import type { Quota, QuotaDimension } from '@/api/types';

function usageCell(d: QuotaDimension) {
  return <Progress percent={Math.round((d.used / d.limit) * 100)} size="small" format={() => `${d.used}/${d.limit}`} />;
}

/** 配额查看与调整（control-plane mock）。 */
export function QuotasPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ['quotas'], queryFn: listQuotas });

  const save = useMutation({
    mutationFn: (v: { row: Quota; limits: Record<'cpu' | 'mem' | 'storage' | 'users', number> }) =>
      updateQuota(v.row.tenantId, {
        cpu: { used: v.row.cpu.used, limit: v.limits.cpu },
        mem: { used: v.row.mem.used, limit: v.limits.mem },
        storage: { used: v.row.storage.used, limit: v.limits.storage },
        users: { used: v.row.users.used, limit: v.limits.users },
      }),
    onSuccess: (q) => {
      void qc.invalidateQueries({ queryKey: ['quotas'] });
      message.success(t('quota.saveOk', { name: q.tenantName }));
    },
  });

  const columns: TableColumnsType<Quota> = [
    { title: t('quota.colTenant'), dataIndex: 'tenantName' },
    { title: t('quota.cpu'), dataIndex: 'cpu', width: 200, render: (d: QuotaDimension) => usageCell(d) },
    { title: t('quota.mem'), dataIndex: 'mem', width: 200, render: (d: QuotaDimension) => usageCell(d) },
    { title: t('quota.storage'), dataIndex: 'storage', width: 200, render: (d: QuotaDimension) => usageCell(d) },
    { title: t('quota.users'), dataIndex: 'users', width: 200, render: (d: QuotaDimension) => usageCell(d) },
    {
      title: '',
      width: 120,
      render: (_, row) => (
        <ModalForm
          title={t('quota.adjustTitle', { name: row.tenantName })}
          trigger={<Button size="small">{t('quota.adjust')}</Button>}
          width={360}
          initialValues={{ cpu: row.cpu.limit, mem: row.mem.limit, storage: row.storage.limit, users: row.users.limit }}
          onFinish={async (values) => {
            await save.mutateAsync({
              row,
              limits: {
                cpu: Number(values.cpu),
                mem: Number(values.mem),
                storage: Number(values.storage),
                users: Number(values.users),
              },
            });
            return true;
          }}
        >
          <ProFormDigit name="cpu" label={`${t('quota.cpu')} · ${t('quota.limit')}`} min={1} />
          <ProFormDigit name="mem" label={`${t('quota.mem')} · ${t('quota.limit')}`} min={1} />
          <ProFormDigit name="storage" label={`${t('quota.storage')} · ${t('quota.limit')}`} min={1} />
          <ProFormDigit name="users" label={`${t('quota.users')} · ${t('quota.limit')}`} min={1} />
        </ModalForm>
      ),
    },
  ];

  return (
    <Card title={t('quota.title')}>
      <Table<Quota> rowKey="tenantId" loading={isLoading} columns={columns} dataSource={data} pagination={false} />
    </Card>
  );
}
