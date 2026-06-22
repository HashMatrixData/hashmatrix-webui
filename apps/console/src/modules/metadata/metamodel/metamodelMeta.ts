import type { ParseKeys } from 'i18next';
import type { TypeCategory, TypeScope, TypeStatus } from '@/mocks/typedefs';

/**
 * 元模型枚举 → Tag 颜色 / i18n key 的单一映射，供清单与详情共用（DRY）。
 * 标签文案统一走 t()，键受 ParseKeys 静态校验。
 */
export const CATEGORY_COLOR: Record<TypeCategory, string> = {
  ENTITY: 'blue',
  CLASSIFICATION: 'purple',
  RELATIONSHIP: 'geekblue',
};
export const CATEGORY_LABEL: Record<TypeCategory, ParseKeys> = {
  ENTITY: 'metamodel.category.entity',
  CLASSIFICATION: 'metamodel.category.classification',
  RELATIONSHIP: 'metamodel.category.relationship',
};

export const SCOPE_COLOR: Record<TypeScope, string> = {
  PLATFORM: 'gold',
  TENANT: 'cyan',
};
export const SCOPE_LABEL: Record<TypeScope, ParseKeys> = {
  PLATFORM: 'metamodel.scope.platform',
  TENANT: 'metamodel.scope.tenant',
};

export const STATUS_COLOR: Record<TypeStatus, string> = {
  DRAFT: 'default',
  PUBLISHED: 'green',
};
export const STATUS_LABEL: Record<TypeStatus, ParseKeys> = {
  DRAFT: 'metamodel.status.draft',
  PUBLISHED: 'metamodel.status.published',
};
