import { useState } from 'react';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { Button, Descriptions, Drawer, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { listTenants } from '@/api/controlPlane';
import type { Tenant } from '@/api/types';
import { TenantStatusTag } from '@/components/TenantStatusTag';

/**
 * 租户目录（列表 + 详情）。跨租户运营视图，ProTable 服务端分页（mock）。
 * 列出全部状态——含软删除（deleted）租户：行保留 + statusReason 留痕，可见审计历史（契约 v1.2.0 / C）。
 */
export function TenantDirectoryPage() {
  const { t } = useTranslation();
  const [detail, setDetail] = useState<Tenant | null>(null);
  const none = t('tenant.none');

  const columns: ProColumns<Tenant>[] = [
    { title: t('tenant.colTenantId'), dataIndex: 'tenantId', width: 170 },
    { title: t('tenant.colName'), dataIndex: 'displayName' },
    { title: t('tenant.colOrg'), width: 160, render: (_, row) => row.organization?.orgAlias ?? none },
    {
      title: t('tenant.colStatus'),
      dataIndex: 'status',
      width: 120,
      render: (_, row) => <TenantStatusTag status={row.status} />,
    },
    { title: t('tenant.colCreatedAt'), dataIndex: 'createdAt', width: 200 },
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
        rowKey="tenantId"
        columns={columns}
        cardBordered
        search={false}
        options={{ reload: false, density: true, setting: true }}
        pagination={{ pageSize: 10 }}
        request={async (params) => {
          const res = await listTenants({ page: params.current, pageSize: params.pageSize });
          return { data: res.items, total: res.total, success: true };
        }}
      />
      <Drawer open={!!detail} title={t('tenant.detailTitle')} width={460} onClose={() => setDetail(null)}>
        {detail && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={t('tenant.colTenantId')}>{detail.tenantId}</Descriptions.Item>
              <Descriptions.Item label={t('tenant.colName')}>{detail.displayName}</Descriptions.Item>
              <Descriptions.Item label={t('tenant.colStatus')}>
                <TenantStatusTag status={detail.status} />
              </Descriptions.Item>
              <Descriptions.Item label={t('tenant.statusReason')}>{detail.statusReason ?? none}</Descriptions.Item>
              <Descriptions.Item label={t('tenant.colCreatedAt')}>{detail.createdAt}</Descriptions.Item>
              <Descriptions.Item label={t('tenant.updatedAt')}>{detail.updatedAt ?? none}</Descriptions.Item>
            </Descriptions>

            <Typography.Title level={5} style={{ marginTop: 16 }}>
              {t('tenant.sectionIdentity')}
            </Typography.Title>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={t('tenant.orgId')}>{detail.organization?.orgId ?? none}</Descriptions.Item>
              <Descriptions.Item label={t('tenant.orgAlias')}>
                {detail.organization?.orgAlias ?? none}
              </Descriptions.Item>
            </Descriptions>

            <Typography.Title level={5} style={{ marginTop: 16 }}>
              {t('tenant.sectionDataPlane')}
            </Typography.Title>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={t('tenant.namespace')}>{detail.dataPlane?.namespace ?? none}</Descriptions.Item>
              <Descriptions.Item label={t('tenant.dbSchema')}>{detail.dataPlane?.dbSchema ?? none}</Descriptions.Item>
              <Descriptions.Item label={t('tenant.dorisCatalog')}>
                {detail.dataPlane?.dorisCatalog ?? none}
              </Descriptions.Item>
              <Descriptions.Item label={t('tenant.helmRelease')}>
                {detail.dataPlane?.helmRelease ?? none}
              </Descriptions.Item>
            </Descriptions>

            <Typography.Title level={5} style={{ marginTop: 16 }}>
              {t('tenant.sectionQuota')}
            </Typography.Title>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={t('quota.maxUsers')}>{detail.quota?.maxUsers ?? none}</Descriptions.Item>
              <Descriptions.Item label={t('quota.maxStorage')}>{detail.quota?.maxStorageGi ?? none}</Descriptions.Item>
              <Descriptions.Item label={t('quota.maxJobs')}>
                {detail.quota?.maxConcurrentJobs ?? none}
              </Descriptions.Item>
              <Descriptions.Item label={t('quota.cpu')}>{detail.quota?.compute?.cpuCores ?? none}</Descriptions.Item>
              <Descriptions.Item label={t('quota.mem')}>{detail.quota?.compute?.memoryGi ?? none}</Descriptions.Item>
            </Descriptions>
          </>
        )}
        <Button style={{ marginTop: 16 }} onClick={() => setDetail(null)} block>
          {t('common.confirm')}
        </Button>
      </Drawer>
    </>
  );
}
