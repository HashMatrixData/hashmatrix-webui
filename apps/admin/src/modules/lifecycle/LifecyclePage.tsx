import { App, Button, Card, Popconfirm, Space, Table, Typography, type TableColumnsType } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { deleteTenant, listTenants, resumeTenant, suspendTenant } from '@/api/controlPlane';
import type { Tenant, TenantStatus } from '@/api/types';
import { TenantStatusTag } from '@/components/TenantStatusTag';

// UI 动作 → 契约端点：启用=resume(suspended→active) / 停用=suspend(active→suspended) / 注销=delete(→deleted)。
type Act = 'enable' | 'disable' | 'deregister';

// 仅对已开通生命周期内的租户操作（registered/approving 属审批面，deleted 终态不再操作）。
const OPERABLE: TenantStatus[] = ['provisioning', 'active', 'suspended'];

/** 生命周期：停用 / 恢复 / 注销（control-plane mock）。注销不可逆，二次确认。 */
export function LifecyclePage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tenants', 'lifecycle'],
    queryFn: () => listTenants({ pageSize: 200 }),
  });
  const rows = (data?.items ?? []).filter((tn) => OPERABLE.includes(tn.status));

  const act = useMutation({
    mutationFn: ({ tn, action }: { tn: Tenant; action: Act }) => {
      if (action === 'enable') return resumeTenant(tn.tenantId);
      if (action === 'disable') return suspendTenant(tn.tenantId);
      return deleteTenant(tn.tenantId);
    },
    onSuccess: (tn) => {
      void qc.invalidateQueries({ queryKey: ['tenants'] });
      message.success(t('lifecycle.actionOk', { name: tn.displayName }));
    },
    onError: (e) =>
      message.error(t('lifecycle.actionFailed', { msg: (e as { message?: string } | undefined)?.message ?? 'Network Error' })),
  });

  const busy = (row: Tenant, a: Act) =>
    act.isPending && act.variables?.tn.tenantId === row.tenantId && act.variables?.action === a;

  const columns: TableColumnsType<Tenant> = [
    { title: t('lifecycle.colTenant'), dataIndex: 'tenantId', width: 180 },
    { title: t('tenant.colName'), dataIndex: 'displayName' },
    {
      title: t('lifecycle.colStatus'),
      dataIndex: 'status',
      width: 130,
      render: (_, row) => <TenantStatusTag status={row.status} />,
    },
    {
      title: '',
      width: 260,
      render: (_, row) => (
        <Space>
          <Button
            size="small"
            disabled={row.status !== 'suspended'}
            loading={busy(row, 'enable')}
            onClick={() => act.mutate({ tn: row, action: 'enable' })}
          >
            {t('lifecycle.enable')}
          </Button>
          <Button
            size="small"
            disabled={row.status !== 'active'}
            loading={busy(row, 'disable')}
            onClick={() => act.mutate({ tn: row, action: 'disable' })}
          >
            {t('lifecycle.disable')}
          </Button>
          <Popconfirm
            title={t('lifecycle.confirmDeregister', { name: row.displayName })}
            okButtonProps={{ danger: true }}
            onConfirm={() => act.mutate({ tn: row, action: 'deregister' })}
          >
            <Button size="small" danger loading={busy(row, 'deregister')}>
              {t('lifecycle.deregister')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title={t('lifecycle.title')}>
      <Typography.Paragraph type="secondary">{t('lifecycle.intro')}</Typography.Paragraph>
      <Table<Tenant>
        rowKey="tenantId"
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        pagination={false}
      />
    </Card>
  );
}
