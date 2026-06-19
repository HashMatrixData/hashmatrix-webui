import type { ParseKeys } from 'i18next';
import type { BrandConfig } from './types';

/**
 * 换肤 demo 预设（模拟运行期 config.js 覆盖品牌色）。
 * 仅含通用脱敏命名，禁止任何真实甲方品牌/色值来源。
 * 真实部署通过 public/config.js 注入，免重建即可换肤。
 */
export interface BrandPreset {
  key: string;
  /** i18n key（受静态校验） */
  labelKey: ParseKeys;
  colorPrimary: string;
  colorSecondary: string;
}

export const BRAND_PRESETS: BrandPreset[] = [
  { key: 'default', labelKey: 'brand.preset.default', colorPrimary: '#059669', colorSecondary: '#10b981' },
  { key: 'violet', labelKey: 'brand.preset.violet', colorPrimary: '#722ed1', colorSecondary: '#eb2f96' },
  { key: 'forest', labelKey: 'brand.preset.forest', colorPrimary: '#389e0d', colorSecondary: '#d48806' },
  { key: 'sunset', labelKey: 'brand.preset.sunset', colorPrimary: '#d4380d', colorSecondary: '#fa8c16' },
];

/** 将预设套用到品牌配置（仅覆盖主辅色，其余字段保持）。 */
export function applyPresetToBrand(brand: BrandConfig, preset: BrandPreset): BrandConfig {
  return { ...brand, colorPrimary: preset.colorPrimary, colorSecondary: preset.colorSecondary };
}
