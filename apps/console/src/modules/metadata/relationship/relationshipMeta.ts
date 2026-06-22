import type { ParseKeys } from 'i18next';
import type { Cardinality, RelationshipType } from '@/mocks/relationships';

// 作用域 / 状态映射复用 shared（DRY）。
export { SCOPE_COLOR, SCOPE_LABEL, STATUS_COLOR, STATUS_LABEL } from '../shared/metaTags';

export const REL_TYPE_COLOR: Record<RelationshipType, string> = {
  CONTAINMENT: 'blue',
  DEPENDENCY: 'orange',
  ASSOCIATION: 'green',
};
export const REL_TYPE_LABEL: Record<RelationshipType, ParseKeys> = {
  CONTAINMENT: 'relationship.type.containment',
  DEPENDENCY: 'relationship.type.dependency',
  ASSOCIATION: 'relationship.type.association',
};

/** 基数符号（语言中立，不走 i18n）。 */
export const CARDINALITY_SYMBOL: Record<Cardinality, string> = {
  ONE_TO_ONE: '1:1',
  ONE_TO_MANY: '1:N',
  MANY_TO_MANY: 'N:M',
};
