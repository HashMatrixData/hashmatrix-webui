import { Suspense } from 'react';
import { ProLayout } from '@ant-design/pro-components';
import { Dropdown, Space, Spin, Tag } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBrandStore } from '@hashmatrix/brand';
import { useThemeStore } from '@hashmatrix/theme';
import { useSession } from '@hashmatrix/sdk';
import { LanguageSwitch, ThemeSwitch } from '@hashmatrix/ui';
import { NAV_ITEMS } from '@/routes/navConfig';

/**
 * 管理平面外壳：ProLayout 导航 + 部署级品牌位 + 语言/明暗切换 + 用户菜单。
 * **不提供换肤**（admin 品牌为部署级，不按租户运行期换肤，见 spec / DoD #5）。
 */
export function AppLayout() {
  const { t } = useTranslation();
  const brand = useBrandStore((s) => s.brand);
  const mode = useThemeStore((s) => s.mode);
  const { user, signOut } = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  const route = {
    path: '/',
    routes: NAV_ITEMS.map((item) => ({ path: item.path, name: t(item.labelKey), icon: item.icon })),
  };

  return (
    <ProLayout
      title={brand.appName}
      logo={mode === 'dark' ? brand.logo.dark : brand.logo.light}
      layout="mix"
      navTheme={mode === 'dark' ? 'realDark' : 'light'}
      fixSiderbar
      location={{ pathname: location.pathname }}
      route={route}
      menuItemRender={(item, dom) => <Link to={item.path ?? '/'}>{dom}</Link>}
      menuExtraRender={() => (
        <Tag color="processing" style={{ marginInlineStart: 8 }}>
          Ops
        </Tag>
      )}
      actionsRender={() => [
        <Space key="actions" size="middle" wrap>
          <LanguageSwitch />
          <ThemeSwitch />
        </Space>,
      ]}
      avatarProps={{
        icon: <UserOutlined />,
        title: user?.name,
        size: 'small',
        render: (_props, dom) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'signout',
                  icon: <LogoutOutlined />,
                  label: t('auth.signOut'),
                  onClick: () => {
                    signOut();
                    navigate('/');
                  },
                },
              ],
            }}
          >
            {dom}
          </Dropdown>
        ),
      }}
      footerRender={() => (
        <div style={{ textAlign: 'center', padding: 16, opacity: 0.65 }}>
          {t('common.poweredBy', { companyName: brand.companyName })}
        </div>
      )}
    >
      <div style={{ padding: 24 }}>
        <Suspense
          fallback={
            <div style={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
              <Spin size="large" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </div>
    </ProLayout>
  );
}
