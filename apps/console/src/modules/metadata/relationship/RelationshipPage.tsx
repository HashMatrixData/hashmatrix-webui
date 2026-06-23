import { Alert, Card, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { RelationshipTable } from './RelationshipTable';

/**
 * 关系定义（元数据管理模块 · 子模块）：关系类型 + 基数 + 源/目标端点清单与只读详情。
 * 对应 governance 元模型引擎（Epic #1 / 子 #7）；后端 post-M1，当前 mock 供数。
 */
export function RelationshipPage() {
  const { t } = useTranslation();

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3}>{t('menu.relationship')}</Typography.Title>
      <Alert type="info" showIcon title={t('relationship.mockBadge')} description={t('relationship.pageDesc')} />
      <Card title={t('relationship.listCardTitle')} styles={{ body: { padding: 0 } }}>
        <RelationshipTable />
      </Card>
    </Space>
  );
}
