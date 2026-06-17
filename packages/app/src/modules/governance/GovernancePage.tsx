import { Alert, Button, Card, Space, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PermissionGuard, usePermission, ROLES } from '@/auth';
import { DatasetTable } from './DatasetTable';

const { Paragraph, Text } = Typography;

/**
 * 数据治理占位页（route-level 角色守卫的落点示例）。
 * 内含按钮级权限示例：删除按钮仅 admin 可见。
 */
export function GovernancePage() {
  const { t } = useTranslation();
  const { roles } = usePermission();

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3}>{t('menu.governance')}</Typography.Title>
      <Alert
        type="info"
        showIcon
        title={
          <span>
            {t('governance.currentRole')}：<Text code>{roles.join(', ') || '—'}</Text>
          </span>
        }
        description={t('governance.routeGuardNote')}
      />
      <Card title={t('governance.buttonPermTitle')}>
        <Paragraph type="secondary">{t('governance.buttonPermDesc')}</Paragraph>
        <PermissionGuard
          roles={[ROLES.ADMIN]}
          fallback={
            <Button danger icon={<DeleteOutlined />} disabled>
              {t('governance.dangerNeedsAdmin')}
            </Button>
          }
        >
          <Button danger icon={<DeleteOutlined />}>
            {t('governance.dangerAction')}
          </Button>
        </PermissionGuard>
      </Card>
      <Card title={t('governance.datasetCardTitle')} styles={{ body: { padding: 0 } }}>
        <DatasetTable />
      </Card>
    </Space>
  );
}
