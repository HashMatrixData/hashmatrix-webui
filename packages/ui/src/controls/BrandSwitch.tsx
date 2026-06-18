import { Select, Space, Tag } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useBrandStore, BRAND_PRESETS } from '@hashmatrix/brand';

/**
 * 换肤 demo：在运行期切换品牌主辅色（模拟 config.js 覆盖）。
 * 真实部署改 public/config.js 即生效、免重建（见 spec §4 换肤流程）。
 */
export function BrandSwitch() {
  const { t } = useTranslation();
  const activePresetKey = useBrandStore((s) => s.activePresetKey);
  const applyPreset = useBrandStore((s) => s.applyPreset);

  return (
    <Select
      aria-label={t('brand.preset.label')}
      value={activePresetKey}
      style={{ minWidth: 160 }}
      suffixIcon={<BgColorsOutlined />}
      onChange={(key) => {
        const preset = BRAND_PRESETS.find((p) => p.key === key);
        if (preset) applyPreset(preset);
      }}
      options={BRAND_PRESETS.map((p) => ({
        value: p.key,
        label: (
          <Space>
            <Tag color={p.colorPrimary} style={{ marginInlineEnd: 0 }}>
              {' '}
            </Tag>
            {t(p.labelKey)}
          </Space>
        ),
      }))}
    />
  );
}
