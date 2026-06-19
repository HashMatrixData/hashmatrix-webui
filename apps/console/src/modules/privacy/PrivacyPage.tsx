import { ProCard } from '@ant-design/pro-components';
import { Alert, Empty, Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useBrandStore } from '@hashmatrix/brand';

/**
 * 隐私计算入口页（#13 · 治理与服务）。挂在「隐私计算」模块首叶 `/privacy/overview`，
 * 由 REAL_PAGE_BY_PATH 覆盖默认占位；同模块其余叶子（PSI / 匿踪查询 / 节点互联）暂留占位，菜单不断链。
 *
 * spec §3 集成矩阵：隐私计算引擎（隐语 SecretFlow / SecretPad）走「集成纳入（iframe + SSO + 品牌化外框）」。
 * 本刀仅落「品牌化外框占位」——真实 iframe + SSO 接入后置。外框品牌取**部署级**品牌（D3：部署期注入、
 * 不按租户运行期换肤），故消费 brand store 而非租户上下文。
 */
export function PrivacyPage() {
  const { t } = useTranslation();
  const brand = useBrandStore((s) => s.brand);

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {t('menu.privacyOverview')}
      </Typography.Title>
      <Typography.Paragraph type="secondary">{t('privacy.intro')}</Typography.Paragraph>

      <Alert type="info" showIcon message={t('privacy.deferredNote')} />

      {/* 品牌化外框：顶部描边取部署级品牌主色（--brand-primary），框住第三方引擎挂载区。
          兜底 brand.colorPrimary 与 CSS 变量同源（cssVars 即用它注入 --brand-primary），仅覆盖变量注入文档根前的首帧。 */}
      <ProCard
        bordered
        style={{ borderTop: `3px solid var(--brand-primary, ${brand.colorPrimary})` }}
        title={
          <Space>
            <span>
              {brand.appName} · {t('menu.privacyComputing')}
            </span>
            <Tag color="purple">SecretFlow / SecretPad</Tag>
          </Space>
        }
      >
        <div style={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description={t('privacy.placeholderText')} />
        </div>
        <Typography.Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 0 }}>
          {t('common.poweredBy', { companyName: brand.companyName })}
        </Typography.Paragraph>
      </ProCard>
    </Space>
  );
}
