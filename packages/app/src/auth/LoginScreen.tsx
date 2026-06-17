import { Button, Card, Space, Typography } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useBrandStore } from '@/brand';
import { useSession } from './useSession';

const { Title, Text } = Typography;

/** 登录壳：未认证时呈现，触发 OIDC 跳转（或 mock 登录）。 */
export function LoginScreen() {
  const { t } = useTranslation();
  const brand = useBrandStore((s) => s.brand);
  const { signIn, isLoading } = useSession();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
      }}
    >
      <Card style={{ width: 380, textAlign: 'center' }}>
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <img src={brand.logo.light} alt={brand.appName} height={36} />
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              {brand.appName}
            </Title>
            <Text type="secondary">{t('auth.loginRequired')}</Text>
          </div>
          <Button type="primary" icon={<LoginOutlined />} loading={isLoading} block onClick={signIn}>
            {t('auth.signIn')}
          </Button>
        </Space>
      </Card>
    </div>
  );
}
