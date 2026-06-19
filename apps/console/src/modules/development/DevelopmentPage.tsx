import { Card, Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { DagGraph } from '@hashmatrix/ui';

/**
 * 数据开发入口页（#11 · 数据生产链）。挂在「数据开发」模块首叶 `/development/data-dev`，
 * 占位被本真页替换；同模块其余叶子（周期任务/临时查询/运维监控）暂留占位，菜单不断链。
 * 复用 `@hashmatrix/ui` 的 `DagGraph`（X6）呈现作业编排——状态色固定，选中任务描边随品牌强调色。
 */
export function DevelopmentPage() {
  const { t } = useTranslation();
  return (
    <Card title={t('menu.devWorkbench')} styles={{ body: { padding: 0 } }}>
      <Typography.Paragraph type="secondary" style={{ padding: '12px 16px 0', marginBottom: 0 }}>
        {t('development.intro')}
      </Typography.Paragraph>
      <Space style={{ padding: '8px 16px 0' }} wrap>
        <Typography.Text type="secondary">{t('development.statusLegend')}</Typography.Text>
        <Tag color="#52c41a">success</Tag>
        <Tag color="#faad14">running</Tag>
        <Tag color="#ff4d4f">failed</Tag>
      </Space>
      <DagGraph height={360} />
    </Card>
  );
}
