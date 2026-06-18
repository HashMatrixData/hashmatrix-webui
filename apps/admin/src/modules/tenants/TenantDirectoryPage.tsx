import { useState } from 'react';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { Button, Descriptions, Drawer, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { listTenants } from '@/api/controlPlane';
import type { Tenant, TenantStatus } from '@/api/types';

const STATUS_COLOR: Record<TenantStatus, string> = {
  active: 'success',
  suspended: 'warning',
  deactivated: 'default',
};

/** 租户目录（列表 + 详情）。跨租户运营视图，ProTable 服务端分页（mock）。 */
export function TenantDirectoryPage() {
  const { t } = useTranslation();
  const [detail, setDetail] = useState<Tenant | null>(null);

  const statusLabel = (s: TenantStatus) =>
    s === 'active' ? t('tenant.statusActive') : s === 'suspended' ? t('tenant.statusSuspended') : t('tenant.statusDeactivated');

  const columns: ProColumns<Tenant>[] = [
    { title: t('tenant.colId'), dataIndex: 'id', search: false, width: 110 },
    { title: t('tenant.colName'), dataIndex: 'name' },
    { title: t('tenant.colOrg'), dataIndex: 'org', search: false },
    { title: t('tenant.colPlan'), dataIndex: 'plan', search: false, width: 120 },
    {
      title: t('tenant.colStatus'),
      dataIndex: 'status',
      search: false,
      width: 120,
      render: (_, row) => <Tag color={STATUS_COLOR[row.status]}>{statusLabel(row.status)}</Tag>,
    },
    { title: t('tenant.colCreatedAt'), dataIndex: 'createdAt', search: false, width: 140 },
    {
      title: '',
      valueType: 'option',
      width: 80,
      render: (_, row) => [
        <a key="d" onClick={() => setDetail(row)}>
          {t('tenant.detail')}
        </a>,
      ],
    },
  ];

  return (
    <>
      <ProTable<Tenant>
        headerTitle={t('tenant.title')}
        rowKey="id"
        columns={columns}
        cardBordered
        pagination={{ pageSize: 10 }}
        search={{ labelWidth: 'auto' }}
        request={async (params) => {
          const res = await listTenants({ current: params.current, pageSize: params.pageSize, name: params.name });
          return { data: res.data, total: res.total, success: true };
        }}
      />
      <Drawer open={!!detail} title={t('tenant.detailTitle')} width={420} onClose={() => setDetail(null)}>
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={t('tenant.colId')}>{detail.id}</Descriptions.Item>
            <Descriptions.Item label={t('tenant.colName')}>{detail.name}</Descriptions.Item>
            <Descriptions.Item label={t('tenant.colOrg')}>{detail.org}</Descriptions.Item>
            <Descriptions.Item label={t('tenant.colPlan')}>{detail.plan}</Descriptions.Item>
            <Descriptions.Item label={t('tenant.colStatus')}>
              <Tag color={STATUS_COLOR[detail.status]}>{statusLabel(detail.status)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('tenant.colCreatedAt')}>{detail.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
        <Button style={{ marginTop: 16 }} onClick={() => setDetail(null)} block>
          {t('common.confirm')}
        </Button>
      </Drawer>
    </>
  );
}
