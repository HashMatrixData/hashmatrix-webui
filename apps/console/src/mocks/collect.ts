/**
 * 采集衔接（Connector SPI）mock —— 采集前端面（governance Epic #1 / 子 #14）。
 *
 * 复用统一数据源（AD-15）做结构扫描：变更集比对（新增/删除/变更）+ 结构异动检测
 * （批量删表/结构突变/字段类型冲突）。本仓只取结构（旁路），不搬数据。后端 post-M1。
 * 红线：均为通用数据源/分层资产占位，无任何真实甲方/业务可识别信息。
 */
export type SourceType = 'MySQL' | 'Hive' | 'Kafka';
export type SourceStatus = 'CONNECTED' | 'ERROR';
export type ChangeKind = 'ADDED' | 'REMOVED' | 'CHANGED';
export type AnomalyKind = 'BULK_DROP' | 'SCHEMA_SHIFT' | 'TYPE_CONFLICT';
export type AnomalySeverity = 'HIGH' | 'MID';
export type RunStatus = 'SUCCESS' | 'ANOMALY';

export interface ConnectorSource {
  id: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  lastScanAt: string | null;
}

export interface ChangeItem {
  kind: ChangeKind;
  asset: string;
  detail: string;
}

export interface Anomaly {
  kind: AnomalyKind;
  asset: string;
  detail: string;
  severity: AnomalySeverity;
}

export interface ScanRun {
  id: string;
  sourceId: string;
  sourceName: string;
  startedAt: string;
  status: RunStatus;
  added: number;
  removed: number;
  changed: number;
  changes: ChangeItem[];
  anomalies: Anomaly[];
}

const MOCK_SCAN_AT = '2026-06-22T00:00:00.000Z';

const INITIAL_SOURCES: ConnectorSource[] = [
  { id: 'src_mysql', name: 'MySQL 业务库', type: 'MySQL', status: 'CONNECTED', lastScanAt: '2026-06-10T08:00:00.000Z' },
  { id: 'src_hive', name: 'Hive 数仓', type: 'Hive', status: 'CONNECTED', lastScanAt: '2026-06-12T08:00:00.000Z' },
  { id: 'src_kafka', name: 'Kafka 集群', type: 'Kafka', status: 'ERROR', lastScanAt: null },
];

const INITIAL_RUNS: ScanRun[] = [
  {
    id: 'run_0001',
    sourceId: 'src_mysql',
    sourceName: 'MySQL 业务库',
    startedAt: '2026-06-10T08:00:00.000Z',
    status: 'SUCCESS',
    added: 2,
    removed: 0,
    changed: 1,
    changes: [
      { kind: 'ADDED', asset: 'mysql.order_item', detail: '新增表' },
      { kind: 'ADDED', asset: 'mysql.coupon', detail: '新增表' },
      { kind: 'CHANGED', asset: 'mysql.user.email', detail: 'varchar(64) → varchar(128)' },
    ],
    anomalies: [],
  },
  {
    id: 'run_0002',
    sourceId: 'src_hive',
    sourceName: 'Hive 数仓',
    startedAt: '2026-06-12T08:00:00.000Z',
    status: 'ANOMALY',
    added: 0,
    removed: 5,
    changed: 2,
    changes: [
      { kind: 'REMOVED', asset: 'dwd.tmp_*', detail: '批量删除 5 张临时表' },
      { kind: 'CHANGED', asset: 'dws.user_metric.amount', detail: 'bigint → decimal' },
      { kind: 'CHANGED', asset: 'dws.order_metric.cnt', detail: 'int → bigint' },
    ],
    anomalies: [
      { kind: 'BULK_DROP', asset: 'dwd.tmp_*', detail: '单次扫描删表 5 张，超阈值', severity: 'HIGH' },
      { kind: 'TYPE_CONFLICT', asset: 'dws.user_metric.amount', detail: '数值精度收窄风险', severity: 'MID' },
    ],
  },
];

export const COLLECT_SOURCES: ConnectorSource[] = structuredClone(INITIAL_SOURCES);
export const SCAN_RUNS: ScanRun[] = structuredClone(INITIAL_RUNS);

// 运行号自增计数器，与数组长度解耦（reset 后复位），避免 reset+连扫产出重复 ID。
let runSeq = INITIAL_RUNS.length;

/** 还原到初始种子（供 story play 隔离；扫描会就地新增运行/更新数据源）。 */
export function resetCollect(): void {
  COLLECT_SOURCES.splice(0, COLLECT_SOURCES.length, ...structuredClone(INITIAL_SOURCES));
  SCAN_RUNS.splice(0, SCAN_RUNS.length, ...structuredClone(INITIAL_RUNS));
  runSeq = INITIAL_RUNS.length;
}

/** 触发扫描：生成一次确定性运行（固定小变更集，无异动），并更新数据源 lastScanAt。 */
export function runScan(source: ConnectorSource): ScanRun {
  const run: ScanRun = {
    id: `run_${String(++runSeq).padStart(4, '0')}`,
    sourceId: source.id,
    sourceName: source.name,
    startedAt: MOCK_SCAN_AT,
    status: 'SUCCESS',
    added: 1,
    removed: 0,
    changed: 1,
    changes: [
      { kind: 'ADDED', asset: `${source.type.toLowerCase()}.new_asset`, detail: '新增结构' },
      { kind: 'CHANGED', asset: `${source.type.toLowerCase()}.some_asset`, detail: '字段定义变化' },
    ],
    anomalies: [],
  };
  SCAN_RUNS.unshift(run);
  const idx = COLLECT_SOURCES.findIndex((s) => s.id === source.id);
  if (idx >= 0) COLLECT_SOURCES[idx] = { ...COLLECT_SOURCES[idx], lastScanAt: MOCK_SCAN_AT };
  return run;
}
