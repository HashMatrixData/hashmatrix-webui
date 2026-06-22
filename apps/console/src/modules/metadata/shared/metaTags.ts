import type { ParseKeys } from 'i18next';
import type { TypeScope, TypeStatus } from '@/mocks/typedefs';

/**
 * 治理通用枚举 → Tag 颜色 / i18n key 的单一映射，供元数据管理各子模块共用（DRY）。
 * 作用域（#10）与生命周期状态（#8）是跨元模型/关系/分类的通用维度，故上提到 shared。
 * 标签文案统一走 t(`meta.*`)，键受 ParseKeys 静态校验。
 */
export const SCOPE_COLOR: Record<TypeScope, string> = {
  PLATFORM: 'gold',
  TENANT: 'cyan',
};
export const SCOPE_LABEL: Record<TypeScope, ParseKeys> = {
  PLATFORM: 'meta.scope.platform',
  TENANT: 'meta.scope.tenant',
};

export const STATUS_COLOR: Record<TypeStatus, string> = {
  DRAFT: 'default',
  PUBLISHED: 'green',
};
export const STATUS_LABEL: Record<TypeStatus, ParseKeys> = {
  DRAFT: 'meta.status.draft',
  PUBLISHED: 'meta.status.published',
};
