import type { BrandConfig } from './types';
import { applyBrandCssVars } from './cssVars';

/** 分发路 4：运行期替换 favicon 槽位。 */
function applyFavicon(href: string): void {
  if (typeof document === 'undefined') return;
  let link = document.getElementById('favicon') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = 'favicon';
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = href;
}

/**
 * 把品牌配置分发到 DOM 副作用通道（CSS Vars + favicon + 文档标题）。
 * AntD token 与 i18n 品牌串走 React 渲染通道（见 theme/ 与 i18n/），不在此处。
 */
export function applyBrandToDocument(brand: BrandConfig): void {
  applyBrandCssVars(brand);
  applyFavicon(brand.logo.favicon);
  if (typeof document !== 'undefined') {
    document.title = brand.appName;
  }
}
