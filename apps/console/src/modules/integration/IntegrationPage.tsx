import { useRef, useState } from 'react';
import type { ParseKeys } from 'i18next';
import {
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';
import { Alert, Badge, Button, Form, Input, InputNumber, Select, Space, Typography } from 'antd';
import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { CrudDrawerForm, useCrudMutation, useTableRequest } from '@hashmatrix/ui/data';
import {
  KNOWN_DATA_SOURCE_TYPES,
  createDataSource,
  listDataSources,
  testDataSourceConnection,
  type DataSourceInput,
  type DataSourceRow,
} from '@/api/dataSources';

/** 连接态 → Badge 状态色（固定语义色，不随品牌换肤，守 D3）+ i18n key（缺省按 unknown）。 */
const STATUS_BADGE: Record<
  NonNullable<DataSourceRow['status']>,
  { status: 'success' | 'error' | 'default'; labelKey: ParseKeys }
> = {
  active: { status: 'success', labelKey: 'integration.statusActive' },
  error: { status: 'error', labelKey: 'integration.statusError' },
  unknown: { status: 'default', labelKey: 'integration.statusUnknown' },
};

/**
 * 数据源接入页（#26 · M2 链① 锚点 · canonical 叶子 `/integration/batch`）。
 * 列表经 axios → `/api/datasources`（msw-first，顶契约 #55 锁定路径）；「新建数据源」复用共享 CRUD 范式
 * （`CrudDrawerForm` + `useCrudMutation`，见 #25），含真实「测试连接」（`POST /test`）。
 * D7：密码仅上行、不回显/不入日志；D8：`type` 驱动方言、不写死 MySQL；D9：租户头由 sdk 拦截器自动附。
 */
export function IntegrationPage() {
  const { t } = useTranslation();
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm<DataSourceInput>();
  const [open, setOpen] = useState(false);

  // 测试连接：独立于提交，回显 ok / 真实错误（不抛、内联 Alert 与提交错误风格一致）。
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);

  const { request, errorNode } = useTableRequest<DataSourceRow>(listDataSources, t('common.loadError'));

  const { submit, submitting, errorNode: submitErrorNode, reset } = useCrudMutation<DataSourceInput>(
    createDataSource,
    { errorText: t('integration.submitError'), onSuccess: () => actionRef.current?.reload() },
  );

  const handleTest = async () => {
    let values: DataSourceInput;
    try {
      // 测连只需连接参数，不强求 name（显示名）——按连接子集校验，语义更贴切。
      await form.validateFields(['host', 'port', 'db', 'username', 'password', 'type']);
      values = form.getFieldsValue();
    } catch {
      return; // 校验失败：字段已内联标红
    }
    setTesting(true);
    try {
      setTestResult(await testDataSourceConnection(values));
    } catch {
      // 网络/异常归一化为失败回显（具体错误已由 sdk 拦截器规整，此处只示意失败）。
      setTestResult({ ok: false });
    } finally {
      setTesting(false);
    }
  };

  const columns: ProColumns<DataSourceRow>[] = [
    { title: t('integration.colName'), dataIndex: 'name', width: 220 },
    { title: t('integration.colType'), dataIndex: 'type', width: 100, search: false },
    { title: t('integration.colHost'), dataIndex: 'host', search: false },
    { title: t('integration.colDb'), dataIndex: 'db', search: false },
    {
      title: t('integration.colStatus'),
      dataIndex: 'status',
      width: 110,
      search: false,
      render: (_, row) => {
        const meta = STATUS_BADGE[row.status ?? 'unknown'];
        return <Badge status={meta.status} text={t(meta.labelKey)} />;
      },
    },
  ];

  return (
    <>
      <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
        <div>
          <Typography.Title level={3} style={{ marginTop: 0 }}>
            {t('menu.dataIntegration')}
          </Typography.Title>
          <Typography.Paragraph type="secondary">{t('integration.intro')}</Typography.Paragraph>
        </div>
        {errorNode}
        <ProTable<DataSourceRow>
          rowKey="id"
          actionRef={actionRef}
          headerTitle={t('integration.tableTitle')}
          columns={columns}
          cardBordered
          pagination={{ pageSize: 10 }}
          search={false}
          options={{ reload: true, density: true, setting: true }}
          toolBarRender={() => [
            <Button
              key="new"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpen(true)}
            >
              {t('integration.newButton')}
            </Button>,
          ]}
          request={request}
        />
      </Space>

      <CrudDrawerForm<DataSourceInput>
        open={open}
        onOpenChange={setOpen}
        form={form}
        title={t('integration.drawerTitle')}
        submitText={t('common.save')}
        cancelText={t('common.cancel')}
        submitting={submitting}
        errorNode={submitErrorNode}
        onReset={() => {
          reset();
          setTestResult(null);
        }}
        onSubmit={submit}
      >
        <Form.Item
          name="name"
          label={t('integration.fldName')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="type"
          label={t('integration.fldType')}
          initialValue={KNOWN_DATA_SOURCE_TYPES[0]}
          rules={[{ required: true }]}
        >
          <Select options={KNOWN_DATA_SOURCE_TYPES.map((v) => ({ value: v, label: v }))} />
        </Form.Item>
        <Form.Item name="host" label={t('integration.fldHost')} rules={[{ required: true }]}>
          <Input placeholder="db.example.com" />
        </Form.Item>
        <Form.Item
          name="port"
          label={t('integration.fldPort')}
          initialValue={3306}
          rules={[{ required: true }]}
        >
          <InputNumber min={1} max={65535} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="db" label={t('integration.fldDb')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="username" label={t('integration.fldUsername')} rules={[{ required: true }]}>
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item name="password" label={t('integration.fldPassword')} rules={[{ required: true }]}>
          {/* D7：密码仅上行；用 Password 输入态，不预填、不回显既有值。 */}
          <Input.Password autoComplete="new-password" />
        </Form.Item>

        <Space orientation="vertical" size="small" style={{ display: 'flex' }}>
          <Button icon={<ThunderboltOutlined />} loading={testing} onClick={handleTest}>
            {t('integration.testButton')}
          </Button>
          {testResult &&
            (testResult.ok ? (
              <Alert type="success" showIcon role="status" message={t('integration.testOk')} />
            ) : (
              <Alert
                type="error"
                showIcon
                role="alert"
                message={`${t('integration.testFailPrefix')}${testResult.error ?? ''}`}
              />
            ))}
        </Space>
      </CrudDrawerForm>
    </>
  );
}
