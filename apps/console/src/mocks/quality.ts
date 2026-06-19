/** 质量规则 mock 数据（脱敏：通用维度/分层表名、虚构计数，无真实业务数据）。 */
export interface QualityRuleRow {
  id: string;
  /** 规则名（脱敏：维度 + 序号）。 */
  name: string;
  /** 目标表（脱敏：分层.表名）。 */
  dataset: string;
  /** 质量维度。 */
  dimension: 'completeness' | 'accuracy' | 'consistency' | 'timeliness' | 'uniqueness';
  /** 最近一次执行结果。 */
  status: 'pass' | 'fail' | 'warn';
  /** 通过率（0–100）。 */
  passRate: number;
  /** 最近执行时刻（固定字符串，确定性 · 不依赖运行时 Date）。 */
  lastRun: string;
}

const DIMENSIONS = ['completeness', 'accuracy', 'consistency', 'timeliness', 'uniqueness'] as const;
const LAYERS = ['ods', 'dwd', 'dws', 'ads'] as const;

/** 生成确定性的 demo 规则（无随机，story/E2E 可断言）。 */
export const QUALITY_RULES: QualityRuleRow[] = Array.from({ length: 48 }, (_, i) => {
  const dimension = DIMENSIONS[i % DIMENSIONS.length];
  const layer = LAYERS[i % LAYERS.length];
  // 确定性状态分布：每 9 个 fail、每 7 个 warn、其余 pass（异常项可被 KPI 断言）。
  const status: QualityRuleRow['status'] = i % 9 === 0 ? 'fail' : i % 7 === 0 ? 'warn' : 'pass';
  const passRate = status === 'pass' ? 99 - (i % 3) : status === 'warn' ? 92 - (i % 5) : 70 + (i % 10);
  return {
    id: `qr_${String(i + 1).padStart(3, '0')}`,
    name: `${dimension}_check_${i + 1}`,
    dataset: `${layer}.table_${i + 1}`,
    dimension,
    status,
    passRate,
    lastRun: `2026-06-${String((i % 28) + 1).padStart(2, '0')} 0${i % 6}:30`,
  };
});
