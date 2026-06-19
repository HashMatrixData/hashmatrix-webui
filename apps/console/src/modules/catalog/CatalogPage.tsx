import { Card, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { DatasetTable } from '@/modules/governance/DatasetTable';

/**
 * 数据地图（canonical 叶子 `/catalog/map`）：全租户数据资产检索入口。
 * 复用 `governance/DatasetTable`（ProTable · 服务端分页 · msw `/api/datasets` 自含数据）。
 */
export function CatalogPage() {
  const { t } = useTranslation();

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {t('menu.catalogMap')}
      </Typography.Title>
      <Typography.Paragraph type="secondary">{t('catalog.intro')}</Typography.Paragraph>
      <Card title={t('catalog.tableCardTitle')} styles={{ body: { padding: 0 } }}>
        <DatasetTable />
      </Card>
    </Space>
  );
}
