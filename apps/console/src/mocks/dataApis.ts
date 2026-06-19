/** 数据服务 API mock（脱敏：虚构 acme 资源名/路径、虚构计数，无真实业务数据；确定性、无随机，E2E 可断言）。 */
export type ApiMethod = 'GET' | 'POST';
export type ApiStatus = 'published' | 'draft' | 'offline';

export interface DataApiRow {
  id: string;
  name: string;
  method: ApiMethod;
  path: string;
  /** 绑定数据集（脱敏：分层.表名）。 */
  dataset: string;
  status: ApiStatus;
  /** QPS 限额。 */
  qps: number;
  /** 累计调用量（虚构）。 */
  calls: number;
}

const LAYERS = ['ods', 'dwd', 'dws', 'ads'] as const;
const METHODS: ApiMethod[] = ['GET', 'POST'];
const STATUSES: ApiStatus[] = ['published', 'draft', 'offline'];

/** 生成确定性 demo 行（脱敏占位 + 取模派生方法/状态）。 */
export const DATA_APIS: DataApiRow[] = Array.from({ length: 24 }, (_, i) => {
  const layer = LAYERS[i % LAYERS.length];
  return {
    id: `api_${String(i + 1).padStart(3, '0')}`,
    name: `get_acme_${layer}_${i + 1}`,
    method: METHODS[i % METHODS.length],
    path: `/api/v1/${layer}/resource_${i + 1}`,
    dataset: `${layer}.table_${i + 1}`,
    status: STATUSES[i % STATUSES.length],
    qps: 50 + (i % 10) * 10,
    calls: 1000 + i * 137,
  };
});
