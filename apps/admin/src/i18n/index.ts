import { createI18n } from '@hashmatrix/i18n';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

// admin 在共享基线命名空间之上叠加自有命名空间并初始化 i18next（导入即副作用初始化）。
const i18n = createI18n({ 'zh-CN': zhCN, 'en-US': enUS });

export default i18n;
