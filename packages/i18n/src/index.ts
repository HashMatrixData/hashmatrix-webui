import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import zhCN, { type Resources } from './locales/zh-CN';
import enUS from './locales/en-US';
import { resolveBrand } from '@hashmatrix/brand';

// i18next 类型增强放在模块内（而非独立 .d.ts），随 import 传播到消费方（console/admin），
// 使 t('...') 的 key 受静态校验 + 自动补全。各 app 的资源以本基线为准（PR-A 暂为 console 资源）。
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: Resources };
  }
}

export const SUPPORTED_LANGUAGES = ['zh-CN', 'en-US'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANG_STORAGE_KEY = 'hm.lang';

// 白标引擎分发路 3：品牌串注入 i18n。
// 1) 作为插值默认变量（文案用 {{appName}}/{{companyName}} 占位引用）；
// 2) 作为可直接 t('brand.appName') 取用的资源。
const brand = resolveBrand();

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'en-US': { translation: enUS },
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

export { getAntdLocale } from './antdLocale';
export default i18n;
