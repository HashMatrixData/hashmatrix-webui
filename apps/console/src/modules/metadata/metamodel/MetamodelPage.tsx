import { Alert, Card, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { TypeDefTable } from './TypeDefTable';

/**
 * 元模型管理（元数据管理模块 · 子模块）：可继承的元类（TypeDef）清单 + 只读详情。
 * 对应 governance 自研元模型引擎（Epic #1 / 子 #5 前端面）；后端 post-M1，当前 mock 供数。
 */
export function MetamodelPage() {
  const { t } = useTranslation();

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3}>{t('menu.metamodel')}</Typography.Title>
      <Alert type="info" showIcon title={t('metamodel.mockBadge')} description={t('metamodel.pageDesc')} />
      <Card title={t('metamodel.listCardTitle')} styles={{ body: { padding: 0 } }}>
        <TypeDefTable />
      </Card>
    </Space>
  );
}
