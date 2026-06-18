/** 数据集 mock 数据（脱敏：通用分层表名、虚构计数，无真实业务数据）。 */
export interface DatasetRow {
  id: string;
  name: string;
  layer: 'ods' | 'dwd' | 'dws' | 'ads';
  owner: string;
  rowCount: number;
  qualityScore: number;
}

const LAYERS = ['ods', 'dwd', 'dws', 'ads'] as const;

/** 生成确定性的 demo 行（无随机，E2E 可断言）。 */
export const DATASETS: DatasetRow[] = Array.from({ length: 56 }, (_, i) => {
  const layer = LAYERS[i % LAYERS.length];
  return {
    id: `ds_${String(i + 1).padStart(3, '0')}`,
    name: `${layer}.table_${i + 1}`,
    layer,
    owner: 'tenant-demo',
    rowCount: (i + 1) * 1000,
    qualityScore: 90 + (i % 10),
  };
});
