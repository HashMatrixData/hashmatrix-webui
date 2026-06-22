import { Suspense } from 'react';
import { ProLayout } from '@ant-design/pro-components';
import { Dropdown, Space, Spin } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBrandStore } from '@hashmatrix/brand';
import { useThemeStore } from '@hashmatrix/theme';
import { useSession, usePermission, isOidcEnabled } from '@hashmatrix/sdk';
import { LanguageSwitch, ThemeSwitch, BrandSwitch, RoleSwitcher } from '@hashmatrix/ui';
import { NAV_ITEMS } from '@/routes/navConfig';

/**
 * 应用外壳：ProLayout 导航 + 品牌位 + 头部操作区（语言/明暗/换肤/角色）+ 用户菜单。
 * 菜单按角色过滤（菜单级=按钮级权限的一种）；governance 另由路由级守卫兜底。
 */
export function AppLayout() {
  const { t } = useTranslation();
  const brand = useBrandStore((s) => s.brand);
  const mode = useThemeStore((s) => s.mode);
  const { user, signOut } = useSession();
  const { can } = usePermission();
  const location = useLocation();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((item) => can(item.roles ?? []));
  const route = {
    path: '/',
    routes: visibleItems.map((item) => ({
      path: item.path,
      name: t(item.labelKey),
      icon: item.icon,
      // 一层子菜单：父项可继承父级角色门控（子项缺省随父）。
      routes: item.children?.map((child) => ({
        path: child.path,
        name: t(child.labelKey),
        icon: child.icon,
      })),
    })),
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
      actionsRender={() => [
        <Space key="actions" size="middle" wrap>
          <LanguageSwitch />
          <ThemeSwitch />
          <BrandSwitch />
          {!isOidcEnabled() && <RoleSwitcher />}
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
