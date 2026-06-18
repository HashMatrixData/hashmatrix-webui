import type { BrandConfig } from './types';
import { composeFontFamily } from './fontStack';

/**
 * CSS Variables 契约（分发路 2）。
 * 供非 AntD 区域消费：画布强调色、自研组件、大屏。
 * 画布只取 `--brand-secondary`（强调/选中/高亮）；结构色与语义状态色固定（见 canvas/theme）。
 */
export const BRAND_CSS_VARS = {
  primary: '--brand-primary',
  secondary: '--brand-secondary',
  fontFamily: '--brand-font-family',
} as const;

/** 将品牌色与字体写入 :root（或指定根节点，Storybook/测试可注入隔离节点）。 */
export function applyBrandCssVars(
  brand: BrandConfig,
  root: HTMLElement | null = document.documentElement,
): void {
  if (!root) return;
  root.style.setProperty(BRAND_CSS_VARS.primary, brand.colorPrimary);
  root.style.setProperty(BRAND_CSS_VARS.secondary, brand.colorSecondary);
  root.style.setProperty(BRAND_CSS_VARS.fontFamily, composeFontFamily(brand.fontFamily));
}
