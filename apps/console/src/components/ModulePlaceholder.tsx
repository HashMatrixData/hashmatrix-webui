import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Empty, Typography } from 'antd';

export interface ModulePlaceholderProps {
  /** 模块标题的 i18n key（受静态校验）。 */
  titleKey: ParseKeys;
}

/**
 * 模块占位页：WP2「使能刀」铺设骨架时，各 canonical 叶子路由的统一标题占位。
 * 各页面刀（#11/#12/#13）只把对应路由的占位换成真页，菜单/路由结构不动。
 */
export function ModulePlaceholder({ titleKey }: ModulePlaceholderProps) {
  const { t } = useTranslation();
  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {t(titleKey)}
      </Typography.Title>
      <Empty description={t('placeholder.comingSoon')} />
    </div>
  );
}
