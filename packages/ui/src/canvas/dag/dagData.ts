/** DAG 编排 demo 数据（脱敏：通用任务名，无真实调度语义）。 */
export type TaskStatus = 'success' | 'running' | 'failed' | 'idle';

export interface DagNode {
  id: string;
  label: string;
  status: TaskStatus;
  /** 当前选中任务（用品牌强调色描边）。 */
  selected?: boolean;
  x: number;
  y: number;
}

export interface DagEdge {
  source: string;
  target: string;
}

export const DAG_NODES: DagNode[] = [
  { id: 'extract', label: 'extract', status: 'success', x: 40, y: 100 },
  { id: 'transform', label: 'transform', status: 'running', x: 240, y: 100, selected: true },
  { id: 'quality', label: 'quality_check', status: 'idle', x: 440, y: 40 },
  { id: 'load', label: 'load', status: 'idle', x: 440, y: 160 },
];

export const DAG_EDGES: DagEdge[] = [
  { source: 'extract', target: 'transform' },
  { source: 'transform', target: 'quality' },
  { source: 'transform', target: 'load' },
];
