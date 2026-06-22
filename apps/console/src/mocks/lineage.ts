/**
 * 血缘图（LineageGraph）mock —— 血缘 + 影响分析前端面（governance Epic #1 / 子 #15）。
 *
 * 表级血缘 DAG：节点含手动布局坐标（确定性，E2E 可断言），边表示数据流向。
 * 后端 post-M1，前端先行 mock。红线：均为通用分层资产占位（ods./dwd./dws./ads.）。
 */
export interface LineageGraphNode {
  /** 资产唯一限定名（同实例 qualifiedName）。 */
  id: string;
  label: string;
  /** 手动布局坐标。 */
  x: number;
  y: number;
}

export interface LineageGraphEdge {
  source: string;
  target: string;
}

export interface LineageGraphData {
  nodes: LineageGraphNode[];
  edges: LineageGraphEdge[];
}

export const LINEAGE_GRAPH: LineageGraphData = {
  nodes: [
    { id: 'ods.user_raw', label: 'ods.user_raw', x: 60, y: 60 },
    { id: 'ods.order_raw', label: 'ods.order_raw', x: 60, y: 200 },
    { id: 'dwd.order_fact', label: 'dwd.order_fact', x: 300, y: 130 },
    { id: 'dws.user_metric', label: 'dws.user_metric', x: 540, y: 60 },
    { id: 'dws.order_metric', label: 'dws.order_metric', x: 540, y: 200 },
    { id: 'ads.dashboard', label: 'ads.dashboard', x: 780, y: 130 },
  ],
  edges: [
    { source: 'ods.user_raw', target: 'dwd.order_fact' },
    { source: 'ods.order_raw', target: 'dwd.order_fact' },
    { source: 'dwd.order_fact', target: 'dws.user_metric' },
    { source: 'dwd.order_fact', target: 'dws.order_metric' },
    { source: 'dws.user_metric', target: 'ads.dashboard' },
    { source: 'dws.order_metric', target: 'ads.dashboard' },
  ],
};

/** 影响分析：从 focusId 沿边正向可达的下游节点集合（BFS）。 */
export function downstreamOf(data: LineageGraphData, focusId: string): string[] {
  const adjacency = new Map<string, string[]>();
  for (const e of data.edges) {
    (adjacency.get(e.source) ?? adjacency.set(e.source, []).get(e.source)!).push(e.target);
  }
  const impacted = new Set<string>();
  const queue = [focusId];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const next of adjacency.get(cur) ?? []) {
      if (!impacted.has(next)) {
        impacted.add(next);
        queue.push(next);
      }
    }
  }
  return [...impacted];
}
