import { Result } from 'antd';
import { useTranslation } from 'react-i18next';

/**
 * 生产构建却未注入 OIDC 配置时的兜底——**明确报错，绝不放行**。
 * 杜绝「无鉴权配置即静默回落 mock 管理员会话」的 fail-open（mock 仅限开发期）。
 */
export function AuthMisconfigured() {
  const { t } = useTranslation();
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <Result status="500" title={t('auth.misconfiguredTitle')} subTitle={t('auth.misconfiguredDesc')} />
    </div>
  );
}
