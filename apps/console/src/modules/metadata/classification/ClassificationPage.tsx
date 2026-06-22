import { Alert, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { ClassificationTree } from './ClassificationTree';

/**
 * 分类树（元数据管理模块 · 子模块）：多级分类，预置只读 + 租户私有扩展。
 * 对应 governance 元模型引擎（Epic #1 / 子 #6）；后端 post-M1，当前 mock 供数。
 */
export function ClassificationPage() {
  const { t } = useTranslation();

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3}>{t('menu.classification')}</Typography.Title>
      <Alert type="info" showIcon title={t('classification.mockBadge')} description={t('classification.pageDesc')} />
      <ClassificationTree />
    </Space>
  );
}
