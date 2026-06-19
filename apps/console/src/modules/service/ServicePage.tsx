import type { ParseKeys } from 'i18next';
import { ProTable, StatisticCard, type ProColumns } from '@ant-design/pro-components';
import { Badge, Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { DATA_APIS, type DataApiRow } from '@/mocks/dataApis';

/** API 状态 → Badge 状态色 + i18n key（状态色固定，不随品牌换肤）。 */
const STATUS_BADGE: Record<
  DataApiRow['status'],
  { status: 'success' | 'warning' | 'default'; labelKey: ParseKeys }
> = {
  published: { status: 'success', labelKey: 'service.statusPublished' },
  draft: { status: 'warning', labelKey: 'service.statusDraft' },
  offline: { status: 'default', labelKey: 'service.statusOffline' },
};

// KPI 由 mock 派生（确定性 · 演示数据自洽）。
const TOTAL = DATA_APIS.length;
const PUBLISHED = DATA_APIS.filter((a) => a.status === 'published').length;
const CALLS = DATA_APIS.reduce((sum, a) => sum + a.calls, 0);

/**
 * 数据服务入口页（#13 · 治理与服务）。挂在「数据服务」模块首叶 `/api-service/developer`，
 * 由 REAL_PAGE_BY_PATH 覆盖默认占位。spec §3「核心流程原生自研」：以数据 API 清单 demo
 * （客户端脱敏数据；方法/状态语义色固定）。
 */
export function ServicePage() {
  const { t } = useTranslation();

  const columns: ProColumns<DataApiRow>[] = [
    { title: t('service.colName'), dataIndex: 'name', width: 180 },
    {
      title: t('service.colMethod'),
      dataIndex: 'method',
      width: 90,
      render: (_, r) => <Tag color={r.method === 'GET' ? 'blue' : 'green'}>{r.method}</Tag>,
    },
    {
      title: t('service.colPath'),
      dataIndex: 'path',
      render: (_, r) => <Typography.Text code>{r.path}</Typography.Text>,
    },
    {
      title: t('service.colDataset'),
      dataIndex: 'dataset',
      width: 150,
      render: (_, r) => <Tag>{r.dataset}</Tag>,
    },
    {
      title: t('service.colStatus'),
      dataIndex: 'status',
      width: 100,
      render: (_, r) => {
        const badge = STATUS_BADGE[r.status];
        return <Badge status={badge.status} text={t(badge.labelKey)} />;
      },
    },
    { title: t('service.colQps'), dataIndex: 'qps', width: 90 },
    { title: t('service.colCalls'), dataIndex: 'calls', width: 110 },
  ];

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {t('menu.apiDeveloper')}
      </Typography.Title>
      <Typography.Paragraph type="secondary">{t('service.intro')}</Typography.Paragraph>

      <StatisticCard.Group direction="row">
        <StatisticCard statistic={{ title: t('service.kpiApis'), value: TOTAL }} />
        <StatisticCard statistic={{ title: t('service.kpiPublished'), value: PUBLISHED }} />
        <StatisticCard statistic={{ title: t('service.kpiCalls'), value: CALLS }} />
      </StatisticCard.Group>

      <ProTable<DataApiRow>
        rowKey="id"
        headerTitle={t('service.tableTitle')}
        columns={columns}
        dataSource={DATA_APIS}
        search={false}
        pagination={{ pageSize: 10 }}
        options={{ reload: false, density: true, setting: true }}
        cardBordered
      />
    </Space>
  );
}
