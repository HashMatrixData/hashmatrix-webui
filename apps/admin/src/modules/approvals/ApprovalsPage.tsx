import { ModalForm, ProFormTextArea } from '@ant-design/pro-components';
import { Alert, App, Button, Card, Space, Table, Typography, type TableColumnsType } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { decideApproval, listTenants } from '@/api/controlPlane';
import type { Tenant, TenantStatus } from '@/api/types';
import { TenantStatusTag } from '@/components/TenantStatusTag';

// 待审队列 = registered（待审批）/ approving（审批中）。无独立 registrations 资源，注册即一条 Tenant。
const PENDING: TenantStatus[] = ['registered', 'approving'];

// sdk http 响应拦截把错误归一化为 ApiError { status, message }；提取可读信息用于反馈。
const errMsg = (e: unknown) => (e as { message?: string } | undefined)?.message ?? 'Network Error';

/** 注册审批：通过即开通（approve）/ 驳回不可逆销毁（reject 必填理由）。control-plane mock。 */
export function ApprovalsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tenants', 'approvals'],
    queryFn: () => listTenants({ pageSize: 200 }),
  });
  // M1 server 未实现 ?status 过滤 → 客户端过滤待审队列。
  const pending = (data?.items ?? []).filter((tn) => PENDING.includes(tn.status));

  const approve = useMutation({
    mutationFn: (tn: Tenant) => decideApproval(tn.tenantId, { decision: 'approve' }),
    onSuccess: (tn) => {
      void qc.invalidateQueries({ queryKey: ['tenants'] });
      message.success(t('approval.approveOk', { name: tn.displayName }));
    },
    onError: (e) => message.error(t('approval.opFailed', { msg: errMsg(e) })),
  });
  const reject = useMutation({
    mutationFn: (v: { tn: Tenant; reason: string }) =>
      decideApproval(v.tn.tenantId, { decision: 'reject', reason: v.reason }),
    onSuccess: (tn) => {
      void qc.invalidateQueries({ queryKey: ['tenants'] });
      message.success(t('approval.rejectOk', { name: tn.displayName }));
    },
    onError: (e) => message.error(t('approval.opFailed', { msg: errMsg(e) })),
  });

  const quotaBrief = (tn: Tenant) => {
    const q = tn.quota;
    if (!q) return t('tenant.none');
    const n = (v?: number) => (typeof v === 'number' ? String(v) : t('tenant.none'));
    return `${n(q.maxUsers)} / ${n(q.maxStorageGi)} GiB / ${n(q.maxConcurrentJobs)}`;
  };

  const columns: TableColumnsType<Tenant> = [
    { title: t('approval.colTenant'), dataIndex: 'tenantId', width: 160 },
    { title: t('approval.colName'), dataIndex: 'displayName' },
    { title: t('approval.colOrg'), width: 140, render: (_, row) => row.organization?.orgAlias ?? t('tenant.none') },
    { title: t('approval.colQuota'), width: 200, render: (_, row) => quotaBrief(row) },
    { title: t('approval.colRequestedAt'), dataIndex: 'createdAt', width: 200 },
    {
      title: t('approval.colStatus'),
      dataIndex: 'status',
      width: 120,
      render: (_, row) => <TenantStatusTag status={row.status} />,
    },
    {
      title: '',
      width: 200,
      render: (_, row) => (
        <Space>
          <Button
            type="primary"
            size="small"
            loading={approve.isPending && approve.variables?.tenantId === row.tenantId}
            onClick={() => approve.mutate(row)}
          >
            {t('approval.approve')}
          </Button>
          <ModalForm
            title={t('approval.rejectTitle', { name: row.displayName })}
            trigger={
              <Button danger size="small">
                {t('approval.reject')}
              </Button>
            }
            width={460}
            modalProps={{ destroyOnClose: true }}
            submitter={{
              searchConfig: { submitText: t('approval.rejectConfirm') },
              submitButtonProps: { danger: true },
            }}
            onFinish={async (values: { reason: string }) => {
              await reject.mutateAsync({ tn: row, reason: values.reason });
              return true;
            }}
          >
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              message={t('approval.rejectWarning')}
            />
            <ProFormTextArea
              name="reason"
              label={t('approval.rejectReason')}
              placeholder={t('approval.rejectReasonPlaceholder')}
              rules={[{ required: true, message: t('approval.rejectReasonRequired') }]}
              fieldProps={{ rows: 3, maxLength: 200, showCount: true }}
            />
          </ModalForm>
        </Space>
      ),
    },
  ];

  return (
    <Card title={t('approval.title')}>
      <Typography.Paragraph type="secondary">{t('approval.intro')}</Typography.Paragraph>
      <Table<Tenant>
        rowKey="tenantId"
        loading={isLoading}
        columns={columns}
        dataSource={pending}
        pagination={false}
        locale={{ emptyText: t('approval.empty') }}
      />
    </Card>
  );
}
