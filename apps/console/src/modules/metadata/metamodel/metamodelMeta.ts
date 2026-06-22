import type { ParseKeys } from 'i18next';
import type { TypeCategory } from '@/mocks/typedefs';

// 作用域 / 状态映射上提至 shared（跨子模块复用）；本文件仅保留元模型特有的「类别」映射。
export { SCOPE_COLOR, SCOPE_LABEL, STATUS_COLOR, STATUS_LABEL } from '../shared/metaTags';

/**
 * 元类「类别」枚举 → Tag 颜色 / i18n key 的单一映射，供清单与详情共用（DRY）。
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
