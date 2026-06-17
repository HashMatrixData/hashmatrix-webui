import defaultBrand from './brand.default.json';
import type { BrandConfig, RuntimeConfig } from './types';

/** 构建期默认品牌（单一品牌配置源）。 */
export const DEFAULT_BRAND: BrandConfig = defaultBrand as BrandConfig;

/** 读取运行期注入配置（window.__CONFIG__），SSR/测试环境安全回落空对象。 */
export function getRuntimeConfig(): RuntimeConfig {
  if (typeof window === 'undefined') return {};
  return window.__CONFIG__ ?? {};
}

/**
 * 解析最终生效品牌：构建期默认 ← 运行期覆盖（深合并到字段级）。
 * logo 槽位整体覆盖时按对象浅合并，保证缺省槽位回落默认。
 */
export function resolveBrand(runtime: RuntimeConfig = getRuntimeConfig()): BrandConfig {
  const override = runtime.brand ?? {};
  return {
    ...DEFAULT_BRAND,
    ...override,
    logo: { ...DEFAULT_BRAND.logo, ...(override.logo ?? {}) },
  };
}
