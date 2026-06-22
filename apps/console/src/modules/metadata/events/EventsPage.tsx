import { Alert, Card, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { EventsTable } from './EventsTable';

/**
 * 变更事件（元数据管理模块 · 子模块）：governance 对外发的异步元数据变更事件只读观测。
 * 对应 governance 元模型引擎（Epic #1 / 子 #16）；后端 post-M1，当前 mock 供数。
 */
export function EventsPage() {
  const { t } = useTranslation();

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3}>{t('menu.events')}</Typography.Title>
      <Alert type="info" showIcon title={t('events.mockBadge')} description={t('events.pageDesc')} />
      <Card title={t('events.listCardTitle')} styles={{ body: { padding: 0 } }}>
        <EventsTable />
      </Card>
    </Space>
  );
}
