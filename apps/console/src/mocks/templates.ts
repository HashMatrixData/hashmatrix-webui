/**
 * 模板库（TypeDefTemplate）mock —— 模板库导入前端面（governance Epic #1 / 子 #11）。
 *
 * 标准模型族（MySQL/Hive/Kafka/REST）：每族打包一组可一键导入的元类（TypeDef）。
 * 导入后落租户私有草稿（TENANT/DRAFT），租户在此基础上裁剪/发布。后端 post-M1，前端先行 mock。
 * 红线：均为通用技术模型占位，无任何真实甲方/业务可识别信息。
 */
import type { TypeDefInput } from './typedefs';

/** 模板来源（标准模型族）。 */
export type TemplateSource = 'MySQL' | 'Hive' | 'Kafka' | 'REST';

export interface TypeDefTemplate {
  key: string;
  displayName: string;
  source: TemplateSource;
  description: string;
  /** 该族包含的元类定义（导入时逐个建库）。 */
  typeDefs: TypeDefInput[];
}

const str = (name: string, required = false): TypeDefInput['attributeDefs'][number] => ({
  name,
  type: 'string',
  required,
  unique: false,
  cardinality: 'SINGLE',
});

export const TEMPLATES: TypeDefTemplate[] = [
  {
    key: 'mysql',
    displayName: 'MySQL 关系模型',
    source: 'MySQL',
    description: '关系型数据库标准模型族：库 / 表 / 字段。',
    typeDefs: [
      {
        name: 'mysql_database',
        displayName: 'MySQL 库',
        category: 'ENTITY',
        superTypes: [],
        description: 'MySQL schema。',
        attributeDefs: [str('qualifiedName', true), str('charset')],
      },
      {
        name: 'mysql_table',
        displayName: 'MySQL 表',
        category: 'ENTITY',
        superTypes: ['mysql_database'],
        description: 'MySQL 表。',
        attributeDefs: [str('qualifiedName', true), str('engine')],
      },
      {
        name: 'mysql_column',
        displayName: 'MySQL 字段',
        category: 'ENTITY',
        superTypes: ['mysql_table'],
        description: 'MySQL 列。',
        attributeDefs: [str('qualifiedName', true), str('dataType', true)],
      },
    ],
  },
  {
    key: 'hive',
    displayName: 'Hive 数仓模型',
    source: 'Hive',
    description: '大数据数仓标准模型族：库 / 表 / 分区 / 字段。',
    typeDefs: [
      {
        name: 'hive_database',
        displayName: 'Hive 库',
        category: 'ENTITY',
        superTypes: [],
        attributeDefs: [str('qualifiedName', true), str('location')],
      },
      {
        name: 'hive_table',
        displayName: 'Hive 表',
        category: 'ENTITY',
        superTypes: ['hive_database'],
        attributeDefs: [str('qualifiedName', true), str('tableType')],
      },
      {
        name: 'hive_partition',
        displayName: 'Hive 分区',
        category: 'ENTITY',
        superTypes: ['hive_table'],
        attributeDefs: [str('qualifiedName', true), str('values')],
      },
      {
        name: 'hive_column',
        displayName: 'Hive 字段',
        category: 'ENTITY',
        superTypes: ['hive_table'],
        attributeDefs: [str('qualifiedName', true), str('dataType', true)],
      },
    ],
  },
  {
    key: 'kafka',
    displayName: 'Kafka 消息模型',
    source: 'Kafka',
    description: '消息中间件标准模型族：集群 / Topic / Schema。',
    typeDefs: [
      {
        name: 'kafka_cluster',
        displayName: 'Kafka 集群',
        category: 'ENTITY',
        superTypes: [],
        attributeDefs: [str('qualifiedName', true)],
      },
      {
        name: 'kafka_topic',
        displayName: 'Kafka Topic',
        category: 'ENTITY',
        superTypes: ['kafka_cluster'],
        attributeDefs: [str('qualifiedName', true), str('partitions')],
      },
      {
        name: 'kafka_schema',
        displayName: 'Kafka Schema',
        category: 'ENTITY',
        superTypes: ['kafka_topic'],
        attributeDefs: [str('qualifiedName', true), str('format')],
      },
    ],
  },
  {
    key: 'rest',
    displayName: 'REST 服务模型',
    source: 'REST',
    description: '数据服务标准模型族：服务 / 端点 / 模型。',
    typeDefs: [
      {
        name: 'rest_service',
        displayName: 'REST 服务',
        category: 'ENTITY',
        superTypes: [],
        attributeDefs: [str('qualifiedName', true), str('baseUrl')],
      },
      {
        name: 'rest_endpoint',
        displayName: 'REST 端点',
        category: 'ENTITY',
        superTypes: ['rest_service'],
        attributeDefs: [str('qualifiedName', true), str('method')],
      },
      {
        name: 'rest_model',
        displayName: 'REST 模型',
        category: 'ENTITY',
        superTypes: [],
        attributeDefs: [str('qualifiedName', true)],
      },
    ],
  },
];
