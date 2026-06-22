import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ProCard, StatisticCard } from '@ant-design/pro-components';
import { Space, Typography } from 'antd';
import { TrendChart } from '@hashmatrix/ui';
import { DATASETS } from '@/mocks/datasets';

/**
 * 租户概览（落地首页 · canonical 叶子 `/`）。
 * 复用 `packages/ui` `TrendChart` + ProComponents `StatisticCard` 组合为使用平面着陆页。
 */
const KPIS: { titleKey: ParseKeys; value: number; suffix: string }[] = [
  // 数据集数与 mock 目录（DatasetTable）同源，演示数据自洽。
  { titleKey: 'overview.kpiDatasets', value: DATASETS.length, suffix: '' },
  { titleKey: 'overview.kpiJobs', value: 342, suffix: '' },
  { titleKey: 'overview.kpiQuality', value: 98.6, suffix: '%' },
  { titleKey: 'overview.kpiPrivacy', value: 12, suffix: '' },
];

export function OverviewPage() {
  const { t } = useTranslation();

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {t('menu.overview')}
      </Typography.Title>
      <Typography.Paragraph type="secondary">{t('overview.intro')}</Typography.Paragraph>

      <StatisticCard.Group direction="row">
        {KPIS.map((k) => (
          <StatisticCard
            key={k.titleKey}
            statistic={{ title: t(k.titleKey), value: k.value, suffix: k.suffix }}
          />
        ))}
      </StatisticCard.Group>

      <ProCard title={t('overview.trendTitle')}>
        {/* TrendChart 为 G2 autoFit（height:100%），需显式定高祖先方能渲染。 */}
        <div style={{ height: 320 }}>
          <TrendChart />
        </div>
      </ProCard>
    </Space>
  );
}
