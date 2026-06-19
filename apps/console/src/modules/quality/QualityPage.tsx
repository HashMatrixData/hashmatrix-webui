import type { ParseKeys } from 'i18next';
import { ProTable, StatisticCard, type ProColumns } from '@ant-design/pro-components';
import { Badge, Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { http } from '@hashmatrix/sdk';
import { QUALITY_RULES, type QualityRuleRow } from '@/mocks/quality';

interface PagedResult {
  data: QualityRuleRow[];
  total: number;
}

/** 维度 → i18n key（受静态校验）。 */
const DIM_LABEL: Record<QualityRuleRow['dimension'], ParseKeys> = {
  completeness: 'quality.dimCompleteness',
  accuracy: 'quality.dimAccuracy',
  consistency: 'quality.dimConsistency',
  timeliness: 'quality.dimTimeliness',
  uniqueness: 'quality.dimUniqueness',
};

/** 状态 → Badge 状态色 + i18n key（状态色固定，不随品牌换肤）。 */
const STATUS_BADGE: Record<
  QualityRuleRow['status'],
  { status: 'success' | 'error' | 'warning'; labelKey: ParseKeys }
> = {
  pass: { status: 'success', labelKey: 'quality.statusPass' },
  warn: { status: 'warning', labelKey: 'quality.statusWarn' },
  fail: { status: 'error', labelKey: 'quality.statusFail' },
};

// KPI 由 mock 规则集派生（确定性 · 演示数据自洽）。
const TOTAL = QUALITY_RULES.length;
const ANOMALIES = QUALITY_RULES.filter((r) => r.status !== 'pass').length;
const PASS_RATE = ((QUALITY_RULES.filter((r) => r.status === 'pass').length / TOTAL) * 100).toFixed(1);

/**
 * 质量监控大盘（canonical 叶子 `/asset/quality/monitor-dashboard`）。
 * KPI 统计卡 + 质量规则执行明细（ProTable · 服务端分页 · msw `/api/quality-rules` 自含数据）。
 */
export function QualityPage() {
  const { t } = useTranslation();

  const columns: ProColumns<QualityRuleRow>[] = [
    { title: t('quality.colName'), dataIndex: 'name' },
    {
      title: t('quality.colDataset'),
      dataIndex: 'dataset',
      search: false,
      width: 160,
      render: (_, row) => <Tag>{row.dataset}</Tag>,
    },
    {
      title: t('quality.colDimension'),
      dataIndex: 'dimension',
      search: false,
      width: 120,
      render: (_, row) => t(DIM_LABEL[row.dimension]),
    },
    {
      title: t('quality.colStatus'),
      dataIndex: 'status',
      search: false,
      width: 110,
      render: (_, row) => {
        const badge = STATUS_BADGE[row.status];
        return <Badge status={badge.status} text={t(badge.labelKey)} />;
      },
    },
    {
      title: t('quality.colPassRate'),
      dataIndex: 'passRate',
      search: false,
      width: 110,
      valueType: 'percent',
    },
    { title: t('quality.colLastRun'), dataIndex: 'lastRun', search: false, width: 150 },
  ];

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {t('menu.qualityDashboard')}
      </Typography.Title>
      <Typography.Paragraph type="secondary">{t('quality.intro')}</Typography.Paragraph>

      <StatisticCard.Group direction="row">
        <StatisticCard statistic={{ title: t('quality.kpiRules'), value: TOTAL }} />
        <StatisticCard statistic={{ title: t('quality.kpiPassRate'), value: PASS_RATE, suffix: '%' }} />
        <StatisticCard statistic={{ title: t('quality.kpiAnomalies'), value: ANOMALIES }} />
        <StatisticCard statistic={{ title: t('quality.kpiCoverage'), value: 87, suffix: '%' }} />
      </StatisticCard.Group>

      <ProTable<QualityRuleRow>
        rowKey="id"
        headerTitle={t('quality.rulesCardTitle')}
        columns={columns}
        cardBordered
        pagination={{ pageSize: 10, showSizeChanger: true }}
        search={{ labelWidth: 'auto' }}
        options={{ reload: true, density: true, setting: true }}
        request={async (params) => {
          const { current, pageSize, name } = params;
          const res = await http.get<PagedResult>('/api/quality-rules', {
            params: { current, pageSize, name },
          });
          return { data: res.data.data, total: res.data.total, success: true };
        }}
      />
    </Space>
  );
}
