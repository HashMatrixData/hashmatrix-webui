/**
 * 元模型（TypeDef）mock 数据 —— 元模型引擎前端面（governance Epic #1 / 子 #5）。
 *
 * 设计蓝本：Apache Atlas TypeDef 体系（entityDef + superTypes 继承 / classificationDef /
 * relationshipDef + 基数）。后端引擎为 post-M1，当前以 msw 自含 mock 供前端先行。
 *
 * 红线：全部为通用技术占位（DataAsset/Table/Column…），无任何真实甲方/业务可识别信息。
 */

/** 属性数据类型（Atlas 基础类型的脱敏子集）。 */
export type AttributeType = 'string' | 'int' | 'long' | 'boolean' | 'date' | 'float' | 'enum';

/** 属性基数（Atlas attribute cardinality）。 */
export type Cardinality = 'SINGLE' | 'LIST' | 'SET';

/** 属性定义：类型 / 必填 / 唯一 / 基数 / 默认（Epic #5「属性定义」DoD）。 */
export interface AttributeDef {
  name: string;
  type: AttributeType;
  required: boolean;
  unique: boolean;
  cardinality: Cardinality;
  defaultValue?: string;
  description?: string;
}

/** 元类类别（Atlas typedef category 的脱敏子集）。 */
export type TypeCategory = 'ENTITY' | 'CLASSIFICATION' | 'RELATIONSHIP';

/** 生命周期状态（Epic #8「草稿→发布」）。 */
export type TypeStatus = 'DRAFT' | 'PUBLISHED';

/** 作用域（Epic #10）：平台公共（共享只读）/ 租户私有（可扩展）。 */
export type TypeScope = 'PLATFORM' | 'TENANT';

/**
 * 元类可编辑输入（新建/编辑表单提交体）：
 * 作用域/状态/版本/时间由「服务端」派生，不由前端提交（#10 作用域 / #8 生命周期）。
 */
export interface TypeDefInput {
  name: string;
  displayName: string;
  category: TypeCategory;
  superTypes: string[];
  description?: string;
  attributeDefs: AttributeDef[];
}

/** 元类（TypeDef）：可继承的元模型定义单元。 */
export interface TypeDef {
  /** 唯一编码（Epic #9「编码唯一」）。 */
  name: string;
  displayName: string;
  category: TypeCategory;
  /** 继承自的父元类编码（Epic #5「superType 继承」）。 */
  superTypes: string[];
  scope: TypeScope;
  status: TypeStatus;
  /** 版本号 vN（Epic #8「版本管理」）。 */
  version: number;
  description?: string;
  attributeDefs: AttributeDef[];
  /** ISO 时间，确定性常量（无随机，便于 E2E 断言）。 */
  updatedAt: string;
}

/**
 * 确定性 mock 元模型族（无随机）：一条平台公共基类 + 三个继承子类，
 * 外加分类、关系与一条租户私有草稿，覆盖继承/基数/作用域/状态各维度。
 */
const INITIAL_TYPEDEFS: TypeDef[] = [
  {
    name: 'DataAsset',
    displayName: '数据资产基类',
    category: 'ENTITY',
    superTypes: [],
    scope: 'PLATFORM',
    status: 'PUBLISHED',
    version: 2,
    description: '所有数据资产实体的公共基类，承载限定名/名称/归属等基础属性。',
    updatedAt: '2026-05-01T08:00:00.000Z',
    attributeDefs: [
      { name: 'qualifiedName', type: 'string', required: true, unique: true, cardinality: 'SINGLE', description: '全局唯一限定名' },
      { name: 'name', type: 'string', required: true, unique: false, cardinality: 'SINGLE', description: '展示名' },
      { name: 'owner', type: 'string', required: false, unique: false, cardinality: 'SINGLE', defaultValue: 'tenant-demo' },
      { name: 'description', type: 'string', required: false, unique: false, cardinality: 'SINGLE' },
    ],
  },
  {
    name: 'Database',
    displayName: '数据库',
    category: 'ENTITY',
    superTypes: ['DataAsset'],
    scope: 'PLATFORM',
    status: 'PUBLISHED',
    version: 1,
    description: '继承自 DataAsset 的库级实体。',
    updatedAt: '2026-05-02T08:00:00.000Z',
    attributeDefs: [
      { name: 'engine', type: 'string', required: false, unique: false, cardinality: 'SINGLE', description: '存储引擎' },
    ],
  },
  {
    name: 'Table',
    displayName: '数据表',
    category: 'ENTITY',
    superTypes: ['DataAsset'],
    scope: 'PLATFORM',
    status: 'PUBLISHED',
    version: 1,
    description: '继承自 DataAsset 的表级实体。',
    updatedAt: '2026-05-03T08:00:00.000Z',
    attributeDefs: [
      { name: 'rowCount', type: 'long', required: false, unique: false, cardinality: 'SINGLE', defaultValue: '0' },
      { name: 'tableType', type: 'enum', required: false, unique: false, cardinality: 'SINGLE', description: 'MANAGED / EXTERNAL / VIEW' },
    ],
  },
  {
    name: 'Column',
    displayName: '字段',
    category: 'ENTITY',
    superTypes: ['DataAsset'],
    scope: 'PLATFORM',
    status: 'PUBLISHED',
    version: 1,
    description: '继承自 DataAsset 的字段级实体。',
    updatedAt: '2026-05-04T08:00:00.000Z',
    attributeDefs: [
      { name: 'dataType', type: 'string', required: true, unique: false, cardinality: 'SINGLE', description: '字段数据类型' },
      { name: 'nullable', type: 'boolean', required: false, unique: false, cardinality: 'SINGLE', defaultValue: 'true' },
      { name: 'ordinalPosition', type: 'int', required: false, unique: false, cardinality: 'SINGLE' },
    ],
  },
  {
    name: 'table_columns',
    displayName: '表-字段（包含）',
    category: 'RELATIONSHIP',
    superTypes: [],
    scope: 'PLATFORM',
    status: 'PUBLISHED',
    version: 1,
    description: '包含关系：一张 Table 含多列 Column（基数 1:N）。',
    updatedAt: '2026-05-05T08:00:00.000Z',
    attributeDefs: [
      { name: 'end1', type: 'string', required: true, unique: false, cardinality: 'SINGLE', defaultValue: 'Table', description: '源端元类' },
      { name: 'end2', type: 'string', required: true, unique: false, cardinality: 'SET', defaultValue: 'Column', description: '目标端元类（多）' },
    ],
  },
  {
    name: 'PII',
    displayName: '个人敏感信息',
    category: 'CLASSIFICATION',
    superTypes: [],
    scope: 'PLATFORM',
    status: 'PUBLISHED',
    version: 1,
    description: '可打在实体/字段上的分类标签（预置只读）。',
    updatedAt: '2026-05-06T08:00:00.000Z',
    attributeDefs: [
      { name: 'level', type: 'enum', required: false, unique: false, cardinality: 'SINGLE', description: 'LOW / MID / HIGH' },
    ],
  },
  {
    name: 'BusinessTerm',
    displayName: '业务术语',
    category: 'ENTITY',
    superTypes: [],
    scope: 'TENANT',
    status: 'DRAFT',
    version: 1,
    description: '租户私有扩展示例：尚处草稿，未发布。',
    updatedAt: '2026-06-10T08:00:00.000Z',
    attributeDefs: [
      { name: 'definition', type: 'string', required: true, unique: false, cardinality: 'SINGLE', description: '术语定义' },
      { name: 'steward', type: 'string', required: false, unique: false, cardinality: 'SINGLE', description: '术语责任人' },
    ],
  },
];

/**
 * 可变工作副本：mock 写接口（POST/PUT）就地变更本数组。
 * 注意：模块级状态在「整页导航」时随模块重求值复位（test-runner 每 story 一次），
 * 但在 `storybook dev` 交互态切换 story **不会**复位——故交互测试须在 play 起始
 * 调 `resetTypedefs()` 保证确定性与可重复性。
 */
export const TYPEDEFS: TypeDef[] = [...INITIAL_TYPEDEFS];

/** 还原 mock 元类到初始种子（供 story play 起始调用，保证每次运行隔离）。 */
export function resetTypedefs(): void {
  TYPEDEFS.splice(0, TYPEDEFS.length, ...INITIAL_TYPEDEFS);
}
