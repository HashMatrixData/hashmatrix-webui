import { Card, Space, Table, Tag, Typography, type TableColumnsType } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { getProvisioningStatus, listTenants } from '@/api/controlPlane';
import type { ProvisioningPhase, ProvisioningStatus, ProvisioningStepStatus } from '@/api/types';

// 整体阶段语义色 + i18n（状态色固定，不随品牌）。
const PHASE: Record<ProvisioningPhase, { color: string; key: ParseKeys }> = {
  pending: { color: 'default', key: 'provision.phasePending' },
  in_progress: { color: 'processing', key: 'provision.phaseInProgress' },
  succeeded: { color: 'success', key: 'provision.phaseSucceeded' },
  failed: { color: 'error', key: 'provision.phaseFailed' },
};
const STEP: Record<ProvisioningStepStatus, { color: string; key: ParseKeys }> = {
  pending: { color: 'default', key: 'provision.stepPending' },
  in_progress: { color: 'processing', key: 'provision.stepInProgress' },
  succeeded: { color: 'success', key: 'provision.stepSucceeded' },
  failed: { color: 'error', key: 'provision.stepFailed' },
  skipped: { color: 'default', key: 'provision.stepSkipped' },
};

/**
 * 开通状态（control-plane mock）。契约无「列举开通作业」端点——开通状态按 `{tenantId}` 单租户寻址
 * （`GET /v1/tenants/{tenantId}/provisioning`）。故先客户端过滤 provisioning 态租户，再逐个取其开通进度。
 */
export function ProvisioningPage() {
  const { t } = useTranslation();
  const { data = [], isLoading } = useQuery({
    queryKey: ['provisioning'],
    queryFn: async () => {
      const { items } = await listTenants({ pageSize: 200 });
      const provisioning = items.filter((tn) => tn.status === 'provisioning');
      return Promise.all(provisioning.map((tn) => getProvisioningStatus(tn.tenantId)));
    },
  });

  const phaseMeta = (p: ProvisioningPhase) =>
    PHASE[p] ?? { color: 'default', key: 'provision.phaseUnknown' as ParseKeys };

  const columns: TableColumnsType<ProvisioningStatus> = [
    { title: t('provision.colTenant'), dataIndex: 'tenantId', width: 180 },
    {
      title: t('provision.colPhase'),
      dataIndex: 'phase',
      width: 120,
      render: (p: ProvisioningPhase) => {
        const m = phaseMeta(p);
        return <Tag color={m.color}>{t(m.key)}</Tag>;
      },
    },
    { title: t('provision.colStarted'), dataIndex: 'startedAt', width: 200, render: (v?: string) => v ?? t('tenant.none') },
    {
      title: t('provision.colSteps'),
      render: (_, row) => (
        <Space wrap>
          {row.steps.map((s) => (
            <Tag key={s.target} color={STEP[s.status].color}>
              {s.target}: {t(STEP[s.status].key)}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  return (
    <Card title={t('provision.title')}>
      <Typography.Paragraph type="secondary">{t('provision.intro')}</Typography.Paragraph>
      <Table<ProvisioningStatus>
        rowKey="tenantId"
        loading={isLoading}
        columns={columns}
        dataSource={data}
        pagination={false}
        locale={{ emptyText: t('provision.empty') }}
      />
    </Card>
  );
}
