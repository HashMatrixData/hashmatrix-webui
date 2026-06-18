import 'react-i18next';
import type { Resources } from './locales/zh-CN';

/**
 * i18next 类型增强：把 zh-CN 资源结构接入 CustomTypeOptions，
 * 使 t('...') 的 key 受静态校验（拼写错误编译期即报）+ 自动补全。
 * en-US 已以 `Resources` 强约束 key 平价（见 locales/en-US.ts）。
 */
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: Resources };
  }
}
