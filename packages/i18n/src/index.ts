import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resolveBrand } from '@hashmatrix/brand';
import baseZhCN from './base/zh-CN';
import baseEnUS from './base/en-US';

export const SUPPORTED_LANGUAGES = ['zh-CN', 'en-US'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANG_STORAGE_KEY = 'hm.lang';

type NamespaceResources = Record<string, unknown>;

/**
 * 由各 app 调用一次：在共享基线命名空间之上叠加该 app 的自有命名空间，初始化 i18next。
 * 白标引擎分发路 3：品牌串（appName/companyName）作为插值默认变量 + 可取资源注入。
 * base 与 app 命名空间不重叠（base: common/language/theme/brand/auth），浅合并即可。
 */
export function createI18n(appResources: {
  'zh-CN': NamespaceResources;
  'en-US': NamespaceResources;
}): typeof i18n {
  const brand = resolveBrand();

  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        'zh-CN': { translation: { ...baseZhCN, ...appResources['zh-CN'] } },
        'en-US': { translation: { ...baseEnUS, ...appResources['en-US'] } },
      },
      fallbackLng: 'zh-CN',
      supportedLngs: [...SUPPORTED_LANGUAGES],
      interpolation: {
        escapeValue: false,
        defaultVariables: { appName: brand.appName, companyName: brand.companyName },
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: LANG_STORAGE_KEY,
      },
    });

  for (const lng of SUPPORTED_LANGUAGES) {
    i18n.addResource(lng, 'translation', 'brand.appName', brand.appName);
    i18n.addResource(lng, 'translation', 'brand.companyName', brand.companyName);
  }

  return i18n;
}

export { getAntdLocale } from './antdLocale';
export type { BaseResources } from './base/zh-CN';
export default i18n;
