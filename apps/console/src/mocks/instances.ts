/**
 * 元数据实例（MetadataInstance）mock —— 实例管理前端面（governance Epic #1 / 子 #13）。
 *
 * 实例遵循元模型（TypeDef）入库，支持维护 / 认领 / 历史快照。后端 post-M1，前端先行 mock。
 * 红线：均为通用分层资产占位（dwd./ods. 等通用分层名），无任何真实甲方/业务可识别信息。
 */
import type { TypeScope } from './typedefs';

/** 实例生命周期状态。 */
export type InstanceStatus = 'ACTIVE' | 'DEPRECATED';

/** 历史快照记录。 */
export interface InstanceSnapshot {
  version: number;
  changedAt: string;
  summary: string;
}

export interface MetadataInstance {
  guid: string;
  /** 所属元类编码（引用 TypeDef.name）。 */
  typeName: string;
  /** 全局唯一限定名。 */
  qualifiedName: string;
  displayName: string;
  /** 遵循元类属性定义的实例属性值。 */
  attributes: Record<string, string | number | boolean>;
  owner: string;
  status: InstanceStatus;
  scope: TypeScope;
  /** 认领人；null 表示未认领。 */
  claimedBy: string | null;
  updatedAt: string;
}

const INITIAL_INSTANCES: MetadataInstance[] = [
  {
    guid: 'inst_0001',
    typeName: 'Table',
    qualifiedName: 'dwd.order_fact',
    displayName: '订单事实表',
    attributes: { rowCount: 1200000, tableType: 'MANAGED' },
    owner: 'tenant-demo',
    status: 'ACTIVE',
    scope: 'TENANT',
    claimedBy: null,
    updatedAt: '2026-06-01T08:00:00.000Z',
  },
  {
    guid: 'inst_0002',
    typeName: 'Table',
    qualifiedName: 'ods.user_raw',
    displayName: '用户原始表',
    attributes: { rowCount: 530000, tableType: 'EXTERNAL' },
    owner: 'tenant-demo',
    status: 'ACTIVE',
    scope: 'TENANT',
    claimedBy: 'analyst-a',
    updatedAt: '2026-06-02T08:00:00.000Z',
  },
  {
    guid: 'inst_0003',
    typeName: 'Column',
    qualifiedName: 'dwd.order_fact.amount',
    displayName: '订单金额',
    attributes: { dataType: 'decimal(18,2)', nullable: false, ordinalPosition: 5 },
    owner: 'tenant-demo',
    status: 'ACTIVE',
    scope: 'TENANT',
    claimedBy: null,
    updatedAt: '2026-06-03T08:00:00.000Z',
  },
  {
    guid: 'inst_0004',
    typeName: 'Column',
    qualifiedName: 'ods.user_raw.user_id',
    displayName: '用户主键',
    attributes: { dataType: 'bigint', nullable: false, ordinalPosition: 1 },
    owner: 'tenant-demo',
    status: 'ACTIVE',
    scope: 'TENANT',
    claimedBy: null,
    updatedAt: '2026-06-04T08:00:00.000Z',
  },
  {
    guid: 'inst_0005',
    typeName: 'Table',
    qualifiedName: 'dws.user_metric_old',
    displayName: '用户指标（废弃）',
    attributes: { rowCount: 80000, tableType: 'MANAGED' },
    owner: 'tenant-demo',
    status: 'DEPRECATED',
    scope: 'TENANT',
    claimedBy: null,
    updatedAt: '2026-05-20T08:00:00.000Z',
  },
];

const INITIAL_HISTORY: Record<string, InstanceSnapshot[]> = {
  inst_0001: [
    { version: 1, changedAt: '2026-04-10T08:00:00.000Z', summary: '采集入库' },
    { version: 2, changedAt: '2026-06-01T08:00:00.000Z', summary: '行数刷新' },
  ],
  inst_0005: [
    { version: 1, changedAt: '2026-03-01T08:00:00.000Z', summary: '采集入库' },
    { version: 2, changedAt: '2026-05-20T08:00:00.000Z', summary: '标记废弃' },
  ],
};

export const INSTANCES: MetadataInstance[] = structuredClone(INITIAL_INSTANCES);
export const INSTANCE_HISTORY: Record<string, InstanceSnapshot[]> = structuredClone(INITIAL_HISTORY);

/** 还原到初始种子（供 story play 隔离；认领会就地变更）。 */
export function resetInstances(): void {
  INSTANCES.splice(0, INSTANCES.length, ...structuredClone(INITIAL_INSTANCES));
  for (const key of Object.keys(INSTANCE_HISTORY)) delete INSTANCE_HISTORY[key];
  Object.assign(INSTANCE_HISTORY, structuredClone(INITIAL_HISTORY));
}
