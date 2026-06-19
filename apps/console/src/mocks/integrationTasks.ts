/** 数据集成任务 mock 数据（脱敏：虚构占位 acme / tenant-demo，无真实业务数据；确定性、无随机，E2E 可断言）。 */
export type IntegrationMode = 'batch' | 'realtime';
export type IntegrationStatus = 'success' | 'running' | 'failed';

export interface IntegrationTaskRow {
  id: string;
  name: string;
  mode: IntegrationMode;
  source: string;
  target: string;
  status: IntegrationStatus;
  /** 最近运行时间（固定字符串，避免依赖运行期时钟，保证 E2E 可断言）。 */
  lastRunAt: string;
}

const MODES: IntegrationMode[] = ['batch', 'realtime'];
const STATUSES: IntegrationStatus[] = ['success', 'running', 'failed'];
const LAYERS = ['dwd', 'dws', 'ads'] as const;

/** 生成确定性 demo 行（脱敏占位 + 取模派生状态/模式）。 */
export const INTEGRATION_TASKS: IntegrationTaskRow[] = Array.from({ length: 12 }, (_, i) => {
  const layer = LAYERS[i % LAYERS.length];
  const day = String((i % 28) + 1).padStart(2, '0');
  const hour = String((i * 2) % 24).padStart(2, '0');
  return {
    id: `job_${String(i + 1).padStart(3, '0')}`,
    name: `sync_acme_${layer}_${i + 1}`,
    mode: MODES[i % MODES.length],
    source: `mysql://acme-ods/db_${(i % 4) + 1}`,
    target: `warehouse.${layer}_table_${i + 1}`,
    status: STATUSES[i % STATUSES.length],
    lastRunAt: `2026-03-${day} ${hour}:00`,
  };
});
