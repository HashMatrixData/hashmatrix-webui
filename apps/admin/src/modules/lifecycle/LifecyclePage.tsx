import { App, Button, Card, Popconfirm, Space, Table, Tag, type TableColumnsType } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { listTenants, tenantLifecycle } from '@/api/controlPlane';
import type { LifecycleAction, Tenant, TenantStatus } from '@/api/types';

const STATUS_COLOR: Record<TenantStatus, string> = { active: 'success', suspended: 'warning', deactivated: 'default' };

/** 生命周期：启用 / 停用 / 注销（control-plane mock）。注销不可逆，二次确认。 */
export function LifecyclePage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tenants', 'lifecycle'],
    queryFn: () => listTenants({ current: 1, pageSize: 100 }),
  });

  const act = useMutation({
    mutationFn: (v: { tenant: Tenant; action: LifecycleAction }) => tenantLifecycle(v.tenant.id, v.action),
    onSuccess: (tenant) => {
      void qc.invalidateQueries({ queryKey: ['tenants'] });
      message.success(t('lifecycle.actionOk', { name: tenant.name }));
    },
  });

  const statusLabel = (s: TenantStatus) =>
    s === 'active' ? t('tenant.statusActive') : s === 'suspended' ? t('tenant.statusSuspended') : t('tenant.statusDeactivated');

  const columns: TableColumnsType<Tenant> = [
    { title: t('lifecycle.colTenant'), dataIndex: 'name' },
    { title: t('tenant.colOrg'), dataIndex: 'org' },
    {
      title: t('lifecycle.colStatus'),
      dataIndex: 'status',
      width: 130,
      render: (s: TenantStatus) => <Tag color={STATUS_COLOR[s]}>{statusLabel(s)}</Tag>,
    },
    {
      title: '',
      width: 240,
      render: (_, row) => {
        const busy = (a: LifecycleAction) =>
          act.isPending && act.variables?.tenant.id === row.id && act.variables?.action === a;
        return (
        <Space>
          <Button
            size="small"
            disabled={row.status === 'active'}
            loading={busy('enable')}
            onClick={() => act.mutate({ tenant: row, action: 'enable' })}
          >
            {t('lifecycle.enable')}
          </Button>
          <Button
            size="small"
            disabled={row.status !== 'active'}
            loading={busy('disable')}
            onClick={() => act.mutate({ tenant: row, action: 'disable' })}
          >
            {t('lifecycle.disable')}
          </Button>
          <Popconfirm
            title={t('lifecycle.confirmDeregister', { name: row.name })}
            okButtonProps={{ danger: true }}
            disabled={row.status === 'deactivated'}
            onConfirm={() => act.mutate({ tenant: row, action: 'deregister' })}
          >
            <Button size="small" danger disabled={row.status === 'deactivated'}>
              {t('lifecycle.deregister')}
            </Button>
          </Popconfirm>
        </Space>
        );
      },
    },
  ];

  return (
    <Card title={t('lifecycle.title')}>
      <Table<Tenant> rowKey="id" loading={isLoading} columns={columns} dataSource={data?.data ?? []} pagination={false} />
    </Card>
  );
}
