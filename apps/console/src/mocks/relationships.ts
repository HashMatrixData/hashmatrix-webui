/**
 * 关系定义（RelationshipDef）mock 数据 —— 关系定义引擎前端面（governance Epic #1 / 子 #7）。
 *
 * 设计蓝本：Atlas relationshipDef（关系类型 + 基数 + 源/目标端点）。后端 post-M1，前端先行 mock。
 * 红线：端点引用通用技术元类（Table/Column/Database…），无任何真实甲方/业务可识别信息。
 */
import type { TypeScope, TypeStatus } from './typedefs';

/** 关系类型：包含（强组合）/ 依赖（血缘）/ 关联（弱引用）。 */
export type RelationshipType = 'CONTAINMENT' | 'DEPENDENCY' | 'ASSOCIATION';

/** 基数：1:1 / 1:N / N:M。 */
export type Cardinality = 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY';

/** 关系端点：绑定到某元类，并在该元类上暴露一个引用属性名。 */
export interface RelationshipEnd {
  /** 端点元类编码（引用 TypeDef.name）。 */
  typeName: string;
  /** 该端点在元类上暴露的引用属性名。 */
  attributeName: string;
}

/** 关系定义：连接两个元类的有向/无向关系。 */
export interface RelationshipDef {
  name: string;
  displayName: string;
  relationshipType: RelationshipType;
  cardinality: Cardinality;
  end1: RelationshipEnd;
  end2: RelationshipEnd;
  scope: TypeScope;
  status: TypeStatus;
  version: number;
  description?: string;
  updatedAt: string;
}

/** 确定性 mock：覆盖三种关系类型、三种基数与平台/租户作用域。 */
const INITIAL_RELATIONSHIPS: RelationshipDef[] = [
  {
    name: 'table_columns',
    displayName: '表-字段',
    relationshipType: 'CONTAINMENT',
    cardinality: 'ONE_TO_MANY',
    end1: { typeName: 'Table', attributeName: 'columns' },
    end2: { typeName: 'Column', attributeName: 'table' },
    scope: 'PLATFORM',
    status: 'PUBLISHED',
    version: 1,
    description: '一张表包含多列（强组合，列随表生命周期）。',
    updatedAt: '2026-05-10T08:00:00.000Z',
  },
  {
    name: 'db_tables',
    displayName: '库-表',
    relationshipType: 'CONTAINMENT',
    cardinality: 'ONE_TO_MANY',
    end1: { typeName: 'Database', attributeName: 'tables' },
    end2: { typeName: 'Table', attributeName: 'db' },
    scope: 'PLATFORM',
    status: 'PUBLISHED',
    version: 1,
    description: '一个库包含多张表。',
    updatedAt: '2026-05-11T08:00:00.000Z',
  },
  {
    name: 'table_lineage',
    displayName: '表级血缘',
    relationshipType: 'DEPENDENCY',
    cardinality: 'MANY_TO_MANY',
    end1: { typeName: 'Table', attributeName: 'downstream' },
    end2: { typeName: 'Table', attributeName: 'upstream' },
    scope: 'PLATFORM',
    status: 'PUBLISHED',
    version: 1,
    description: '表与表之间的上下游依赖（血缘）。',
    updatedAt: '2026-05-12T08:00:00.000Z',
  },
  {
    name: 'asset_terms',
    displayName: '资产-业务术语',
    relationshipType: 'ASSOCIATION',
    cardinality: 'MANY_TO_MANY',
    end1: { typeName: 'DataAsset', attributeName: 'terms' },
    end2: { typeName: 'BusinessTerm', attributeName: 'assets' },
    scope: 'TENANT',
    status: 'DRAFT',
    version: 1,
    description: '租户私有扩展示例：资产关联业务术语（弱引用）。',
    updatedAt: '2026-06-12T08:00:00.000Z',
  },
];

export const RELATIONSHIPS: RelationshipDef[] = structuredClone(INITIAL_RELATIONSHIPS);

/** 还原到初始种子（供 story play 隔离；深拷贝防御未来写接口污染种子）。 */
export function resetRelationships(): void {
  RELATIONSHIPS.splice(0, RELATIONSHIPS.length, ...structuredClone(INITIAL_RELATIONSHIPS));
}
