import { App, Button, Card, Space, Table, Tag, type TableColumnsType } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { approveRegistration, listRegistrations, rejectRegistration } from '@/api/controlPlane';
import type { ApprovalStatus, Registration } from '@/api/types';

const STATUS_COLOR: Record<ApprovalStatus, string> = { pending: 'processing', approved: 'success', rejected: 'error' };

/** 注册审批：待审 / 通过 / 驳回（control-plane mock）。 */
export function ApprovalsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({ queryKey: ['registrations'], queryFn: listRegistrations });

  const approve = useMutation({
    mutationFn: (r: Registration) => approveRegistration(r.id),
    onSuccess: (r) => {
      void qc.invalidateQueries({ queryKey: ['registrations'] });
      message.success(t('approval.approveOk', { name: r.tenantName }));
    },
  });
  const reject = useMutation({
    mutationFn: (r: Registration) => rejectRegistration(r.id),
    onSuccess: (r) => {
      void qc.invalidateQueries({ queryKey: ['registrations'] });
      message.success(t('approval.rejectOk', { name: r.tenantName }));
    },
  });

  const statusLabel = (s: ApprovalStatus) =>
    s === 'pending' ? t('approval.pending') : s === 'approved' ? t('approval.approved') : t('approval.rejected');

  const columns: TableColumnsType<Registration> = [
    { title: t('approval.colTenant'), dataIndex: 'tenantName' },
    { title: t('approval.colOrg'), dataIndex: 'org' },
    { title: t('approval.colPlan'), dataIndex: 'requestedPlan', width: 140 },
    { title: t('approval.colRequestedAt'), dataIndex: 'requestedAt', width: 140 },
    {
      title: t('tenant.colStatus'),
      dataIndex: 'status',
      width: 120,
      render: (s: ApprovalStatus) => <Tag color={STATUS_COLOR[s]}>{statusLabel(s)}</Tag>,
    },
    {
      title: '',
      width: 180,
      render: (_, row) =>
        row.status === 'pending' ? (
          <Space>
            <Button
              type="primary"
              size="small"
              loading={approve.isPending && approve.variables?.id === row.id}
              onClick={() => approve.mutate(row)}
            >
              {t('approval.approve')}
            </Button>
            <Button
              danger
              size="small"
              loading={reject.isPending && reject.variables?.id === row.id}
              onClick={() => reject.mutate(row)}
            >
              {t('approval.reject')}
            </Button>
          </Space>
        ) : null,
    },
  ];

  return (
    <Card title={t('approval.title')}>
      <Table<Registration>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={data}
        pagination={false}
      />
    </Card>
  );
}
