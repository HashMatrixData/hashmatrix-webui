import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { LineageGraph } from '@/canvas/lineage/LineageGraph';

/** 数据血缘页（DoD #5）：G6 血缘图，聚焦节点强调色随品牌。 */
export function LineagePage() {
  const { t } = useTranslation();
  return (
    <Card title={t('menu.lineage')} styles={{ body: { padding: 0 } }}>
      <Typography.Paragraph type="secondary" style={{ padding: '12px 16px 0' }}>
        {t('lineage.focusNote')}
      </Typography.Paragraph>
      <LineageGraph height={360} />
    </Card>
  );
}
