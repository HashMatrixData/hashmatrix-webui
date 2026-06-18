import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import type { Locale } from 'antd/es/locale';
import type { AppLanguage } from './index';

/** 语言 → AntD locale（日期/数字/组件文案本地化）。 */
export function getAntdLocale(language: string): Locale {
  return language.startsWith('en') ? enUS : zhCN;
}

export type { AppLanguage };
