import 'react-i18next';
import type { BaseResources } from '@hashmatrix/i18n';
import type { AdminResources } from './locales/zh-CN';

// admin 的 i18n 类型增强：基线命名空间 + admin 自有命名空间，t() key 受静态校验。
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: BaseResources & AdminResources };
  }
}
