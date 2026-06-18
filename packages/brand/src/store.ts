import { create } from 'zustand';
import type { BrandConfig } from './types';
import { resolveBrand } from './resolve';
import { applyBrandToDocument } from './applyBrand';
import { applyPresetToBrand, BRAND_PRESETS, type BrandPreset } from './presets';

const ACTIVE_PRESET_KEY = 'hm.brand.preset';

interface BrandState {
  brand: BrandConfig;
  activePresetKey: string;
  /** 整体替换品牌（运行期覆盖入口），同步分发 DOM 副作用。 */
  setBrand: (brand: BrandConfig) => void;
  /** 换肤 demo：套用预设主辅色。 */
  applyPreset: (preset: BrandPreset) => void;
}

function readPersistedPresetKey(): string {
  if (typeof localStorage === 'undefined') return 'default';
  return localStorage.getItem(ACTIVE_PRESET_KEY) ?? 'default';
}

/** 初始品牌：构建期默认 ← 运行期 config.js ← 持久化的换肤预设。 */
function initialBrand(): { brand: BrandConfig; activePresetKey: string } {
  const base = resolveBrand();
  const presetKey = readPersistedPresetKey();
  const preset = BRAND_PRESETS.find((p) => p.key === presetKey);
  const brand = preset ? applyPresetToBrand(base, preset) : base;
  return { brand, activePresetKey: preset ? preset.key : 'default' };
}

const init = initialBrand();

export const useBrandStore = create<BrandState>((set, get) => ({
  brand: init.brand,
  activePresetKey: init.activePresetKey,
  setBrand: (brand) => {
    applyBrandToDocument(brand);
    set({ brand });
  },
  applyPreset: (preset) => {
    const next = applyPresetToBrand(get().brand, preset);
    applyBrandToDocument(next);
    if (typeof localStorage !== 'undefined') localStorage.setItem(ACTIVE_PRESET_KEY, preset.key);
    set({ brand: next, activePresetKey: preset.key });
  },
}));

/** 在应用挂载早期调用一次：把初始品牌分发到 document（CSS Vars / favicon / title）。 */
export function bootstrapBrand(): void {
  applyBrandToDocument(useBrandStore.getState().brand);
}
