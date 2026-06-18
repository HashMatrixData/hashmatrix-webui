import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'hm.theme';

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function initialMode(): ThemeMode {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  }
  return systemPrefersDark() ? 'dark' : 'light';
}

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

function persist(mode: ThemeMode): void {
  if (typeof localStorage !== 'undefined') localStorage.setItem(THEME_STORAGE_KEY, mode);
  if (typeof document !== 'undefined') {
    // 供 CSS 变量作用域 / 画布主题消费暗色态。
    document.documentElement.dataset.theme = mode;
  }
}

const init = initialMode();
persist(init);

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: init,
  setMode: (mode) => {
    persist(mode);
    set({ mode });
  },
  toggle: () => {
    const next: ThemeMode = get().mode === 'dark' ? 'light' : 'dark';
    persist(next);
    set({ mode: next });
  },
}));
