/** 数据安全资产 mock（脱敏：分层.字段占位、通用敏感类别，无真实业务数据；确定性、无随机，E2E 可断言）。 */
export type SecurityLevel = 'public' | 'internal' | 'confidential' | 'secret';
export type SecurityCategory = 'pii' | 'financial' | 'contact' | 'general';
export type MaskStrategy = 'none' | 'partial' | 'hash' | 'encrypt';
export type ProtectStatus = 'protected' | 'pending' | 'exposed';

export interface SecurityAssetRow {
  id: string;
  /** 数据资产（脱敏：分层.字段占位）。 */
  asset: string;
  category: SecurityCategory;
  level: SecurityLevel;
  /** 脱敏策略。 */
  mask: MaskStrategy;
  /** 保护状态。 */
  status: ProtectStatus;
}

const LAYERS = ['ods', 'dwd', 'dws'] as const;
const CATEGORIES: SecurityCategory[] = ['pii', 'financial', 'contact', 'general'];
const LEVELS: SecurityLevel[] = ['public', 'internal', 'confidential', 'secret'];
const MASKS: MaskStrategy[] = ['none', 'partial', 'hash', 'encrypt'];

/** 生成确定性 demo 行（脱敏占位 + 取模派生级别/策略；未脱敏者标 pending/exposed 供状态列 Badge 演示三态）。 */
export const SECURITY_ASSETS: SecurityAssetRow[] = Array.from({ length: 36 }, (_, i) => {
  const layer = LAYERS[i % LAYERS.length];
  // mask 与 level 取不同步长以解相关（避免「公开恒未脱敏」的人为对齐）。
  const mask = MASKS[(i * 3) % MASKS.length];
  const status: ProtectStatus = mask === 'none' ? (i % 5 === 0 ? 'exposed' : 'pending') : 'protected';
  return {
    id: `sa_${String(i + 1).padStart(3, '0')}`,
    asset: `${layer}.field_${i + 1}`,
    category: CATEGORIES[i % CATEGORIES.length],
    level: LEVELS[i % LEVELS.length],
    mask,
    status,
  };
});
