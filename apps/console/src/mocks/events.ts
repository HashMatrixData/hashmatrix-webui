/**
 * 元数据变更事件（ChangeEvent）mock —— 变更事件前端面（governance Epic #1 / 子 #16）。
 *
 * governance 对外发的异步事件（Kafka topic `hashmatrix.governance.metadata.*`）：
 * 元模型变更 / 采集异动 / 实例变更。前端只读观测（事件由后端发布）。后端 post-M1。
 * 红线：均为通用占位，无任何真实甲方/业务可识别信息。
 */
/**
 * 事件类型。对应主仓 ICD `icd/governance-metadata` 的事件名（带 `metadata.` 前缀）：
 * model.changed ↔ metadata.model.changed；collect.anomaly ↔ metadata.collect.anomaly；
 * instance.changed ↔ metadata.instance.changed。后端 payload schema 定稿后取齐前缀。
 */
export type EventType = 'model.changed' | 'collect.anomaly' | 'instance.changed';

export interface ChangeEvent {
  id: string;
  type: EventType;
  topic: string;
  /** 事件主体（变更对象编码/限定名）。 */
  subject: string;
  occurredAt: string;
  summary: string;
}

const TOPIC: Record<EventType, string> = {
  'model.changed': 'hashmatrix.governance.metadata.model',
  'collect.anomaly': 'hashmatrix.governance.metadata.collect',
  'instance.changed': 'hashmatrix.governance.metadata.instance',
};

const ev = (
  seq: number,
  type: EventType,
  subject: string,
  summary: string,
  day: number,
): ChangeEvent => ({
  id: `evt_${String(seq).padStart(4, '0')}`,
  type,
  topic: TOPIC[type],
  subject,
  occurredAt: `2026-06-${String(day).padStart(2, '0')}T08:00:00.000Z`,
  summary,
});

/** 确定性事件流（无随机，按时间倒序）。 */
export const CHANGE_EVENTS: ChangeEvent[] = [
  ev(8, 'instance.changed', 'dwd.order_fact', '实例认领：tenant-demo', 18),
  ev(7, 'collect.anomaly', 'dwd.tmp_*', '批量删表异动（5 张）', 17),
  ev(6, 'model.changed', 'BusinessTerm', '元类发布 v1', 16),
  ev(5, 'instance.changed', 'ods.user_raw', '安全标签回写', 15),
  ev(4, 'model.changed', 'Table', '属性新增 rowCount', 14),
  ev(3, 'collect.anomaly', 'dws.user_metric.amount', '字段类型冲突', 13),
  ev(2, 'instance.changed', 'dwd.order_fact', '采集入库', 12),
  ev(1, 'model.changed', 'DataAsset', '元类发布 v2', 11),
];
