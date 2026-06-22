import { Alert, Card, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { InstanceTable } from './InstanceTable';

/**
 * 元数据实例（元数据管理模块 · 子模块）：遵循元模型入库的资产实例，清单 / 详情 / 认领 / 历史。
 * 对应 governance 元模型引擎（Epic #1 / 子 #13）；后端 post-M1，当前 mock 供数。
 */
export function InstancePage() {
  const { t } = useTranslation();

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3}>{t('menu.instance')}</Typography.Title>
      <Alert type="info" showIcon title={t('instance.mockBadge')} description={t('instance.pageDesc')} />
      <Card title={t('instance.listCardTitle')} styles={{ body: { padding: 0 } }}>
        <InstanceTable />
      </Card>
    </Space>
  );
}
