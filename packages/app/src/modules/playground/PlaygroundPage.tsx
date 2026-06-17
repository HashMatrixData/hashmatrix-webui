import { Button, Card, Space, Typography, theme as antdTheme } from 'antd';
import { useTranslation } from 'react-i18next';
import { useBrandStore, BRAND_CSS_VARS } from '@/brand';
import { LanguageSwitch, ThemeSwitch, BrandSwitch } from '@/shared/controls';

const { Title, Paragraph, Text } = Typography;

/**
 * 三开关 Demo（DoD #3）：语言 / 明暗 / 换肤 实时联动。
 * - 主色经 AntD token 全量分发（Button 等组件）。
 * - 辅色经 CSS Var `--brand-secondary` 分发，下方强调卡片直接消费。
 */
export function PlaygroundPage() {
  const { t } = useTranslation();
  const brand = useBrandStore((s) => s.brand);
  const { token } = antdTheme.useToken();

  return (
    <Space orientation="vertical" size="large" style={{ display: 'flex' }}>
      <div>
        <Title level={3} style={{ marginBottom: 4 }}>
          {t('demo.title')}
        </Title>
        <Text type="secondary">{t('demo.subtitle')}</Text>
      </div>

      <Card>
        <Space size="large" wrap>
          <Space orientation="vertical" size={4}>
            <Text type="secondary">{t('language.label')}</Text>
            <LanguageSwitch />
          </Space>
          <Space orientation="vertical" size={4}>
            <Text type="secondary">{t('theme.label')}</Text>
            <ThemeSwitch />
          </Space>
          <Space orientation="vertical" size={4}>
            <Text type="secondary">{t('brand.preset.label')}</Text>
            <BrandSwitch />
          </Space>
        </Space>
      </Card>

      <Space size="large" wrap align="start">
        <Card title={t('demo.sampleCardTitle')} style={{ width: 320 }}>
          <Space orientation="vertical">
            <Text>
              {t('demo.primaryColor')}: <Text code>{brand.colorPrimary}</Text>
            </Text>
            <Text>
              {t('demo.secondaryColor')}: <Text code>{brand.colorSecondary}</Text>
            </Text>
            <Button type="primary">{t('demo.sampleButton')}</Button>
          </Space>
        </Card>

        <Card
          title={t('demo.sampleCardTitle')}
          style={{
            width: 320,
            // 直接消费 CSS Var 辅色（非 AntD 区域换肤通道）。
            borderTop: `4px solid var(${BRAND_CSS_VARS.secondary})`,
          }}
        >
          <Paragraph style={{ marginBottom: 12 }}>{t('demo.sampleCardDesc')}</Paragraph>
          <div
            style={{
              height: 48,
              borderRadius: token.borderRadius,
              background: `var(${BRAND_CSS_VARS.secondary})`,
            }}
          />
        </Card>
      </Space>
    </Space>
  );
}
