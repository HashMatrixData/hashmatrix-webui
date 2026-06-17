/** 血缘 demo 数据（脱敏：通用分层表名 ods/dwd/dws/ads，无任何真实业务语义）。 */
export interface LineageNode {
  id: string;
  label: string;
  /** 是否为当前聚焦节点（用品牌强调色描边）。 */
  focus?: boolean;
  /** 布局坐标（手动布局，E2E 可确定性断言）。 */
  x: number;
  y: number;
}

export interface LineageEdge {
  source: string;
  target: string;
}

export const LINEAGE_NODES: LineageNode[] = [
  { id: 'ods_a', label: 'ods.table_a', x: 40, y: 40 },
  { id: 'ods_b', label: 'ods.table_b', x: 40, y: 140 },
  { id: 'dwd_join', label: 'dwd.join_ab', x: 240, y: 90 },
  { id: 'dws_agg', label: 'dws.agg_daily', x: 440, y: 90, focus: true },
  { id: 'ads_report', label: 'ads.report', x: 640, y: 90 },
];

export const LINEAGE_EDGES: LineageEdge[] = [
  { source: 'ods_a', target: 'dwd_join' },
  { source: 'ods_b', target: 'dwd_join' },
  { source: 'dwd_join', target: 'dws_agg' },
  { source: 'dws_agg', target: 'ads_report' },
];
