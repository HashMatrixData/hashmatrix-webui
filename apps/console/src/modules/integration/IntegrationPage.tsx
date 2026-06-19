import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { Card, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  INTEGRATION_TASKS,
  type IntegrationStatus,
  type IntegrationTaskRow,
} from '@/mocks/integrationTasks';

/** 任务状态 → 固定语义色（与 DAG 画布同一套语义，不随品牌变化）。 */
const STATUS_COLOR: Record<IntegrationStatus, string> = {
  success: '#52c41a',
  running: '#faad14',
  failed: '#ff4d4f',
};

/** 任务状态 → i18n 叶子 key（显式映射，受 ParseKeys 静态校验）。 */
const STATUS_LABEL_KEY = {
  success: 'integration.statusSuccess',
  running: 'integration.statusRunning',
  failed: 'integration.statusFailed',
} as const;

/**
 * 数据集成入口页（#11 · 数据生产链）。挂在「数据集成」模块首叶 `/integration/batch`，
 * 由 navConfig→router 的占位被本真页替换；同模块其余叶子（实时集成等）暂留占位，菜单不断链。
 * 以 ProTable 呈现离线/实时集成任务一览（客户端 demo 数据，脱敏；状态色固定）。
 */
export function IntegrationPage() {
  const { t } = useTranslation();

  const columns: ProColumns<IntegrationTaskRow>[] = [
    { title: t('integration.colName'), dataIndex: 'name', width: 200 },
    {
      title: t('integration.colMode'),
      dataIndex: 'mode',
      width: 100,
      render: (_, row) => (
        <Tag>{row.mode === 'batch' ? t('integration.modeBatch') : t('integration.modeRealtime')}</Tag>
      ),
    },
    { title: t('integration.colSource'), dataIndex: 'source' },
    { title: t('integration.colTarget'), dataIndex: 'target' },
    {
      title: t('integration.colStatus'),
      dataIndex: 'status',
      width: 110,
      render: (_, row) => <Tag color={STATUS_COLOR[row.status]}>{t(STATUS_LABEL_KEY[row.status])}</Tag>,
    },
    { title: t('integration.colLastRun'), dataIndex: 'lastRunAt', width: 160 },
  ];

  return (
    <Card title={t('menu.dataIntegration')} styles={{ body: { padding: 0 } }}>
      <Typography.Paragraph type="secondary" style={{ padding: '12px 16px 0' }}>
        {t('integration.intro')}
      </Typography.Paragraph>
      <ProTable<IntegrationTaskRow>
        rowKey="id"
        columns={columns}
        dataSource={INTEGRATION_TASKS}
        search={false}
        pagination={{ pageSize: 10 }}
        options={{ reload: false, density: true, setting: true }}
        cardBordered={false}
      />
    </Card>
  );
}
