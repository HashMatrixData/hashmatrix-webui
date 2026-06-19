import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { LineageGraph } from '@hashmatrix/ui';

/**
 * 数据架构入口页（#11 · 数据生产链）。挂在「数据架构」模块首叶 `/standard/warehouse-design`，
 * 占位被本真页替换；同模块其余叶子（数据标准/数据建模等）暂留占位，菜单不断链。
 * 复用 `@hashmatrix/ui` 的 `LineageGraph`（G6）呈现数仓分层血缘——聚焦节点描边随品牌强调色。
 */
export function ArchitecturePage() {
  const { t } = useTranslation();
  return (
    <Card title={t('menu.warehouseDesign')} styles={{ body: { padding: 0 } }}>
      <Typography.Paragraph type="secondary" style={{ padding: '12px 16px 0' }}>
        {t('architecture.intro')}
      </Typography.Paragraph>
      <LineageGraph height={360} />
    </Card>
  );
}
