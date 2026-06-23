import type { ParseKeys } from 'i18next';

/** 默认 DQC 质检模板强度（落标稽核按 layer.code 套用；ODS 宽松 → DWS/ADS 严格）。 */
export type DqcTemplate = 'loose' | 'standard' | 'strict';

/** 分层在 OneData 金字塔中的层带（贴源 / 公共 / 应用），决定卡片分组与配色。 */
export type LayerTier = 'source' | 'common' | 'app';

/** 数仓分层（OneData 五层）——前缀 / TTL / DQC 为分层级默认治理属性，供建模继承。 */
export interface WarehouseLayerRow {
  /** 预置五层编码（OneData）。 */
  code: 'ODS' | 'DIM' | 'DWD' | 'DWS' | 'ADS';
  name: string;
  /** 排序（1..5，自下而上）。 */
  seq: number;
  tier: LayerTier;
  /** 物理表强制前缀，建表网关据此校验归属。 */
  prefix: string;
  /** 默认生命周期 TTL 策略（取值见 {@link TTL_OPTIONS}）。 */
  ttl: string;
  /** 默认 DQC 质检模板强度（落标稽核按 layer.code 映射）。 */
  dqc: DqcTemplate;
  /** 治理防线职责说明（越往上质检越严、对外暴露风险越高）。 */
  duty: string;
  description: string;
  /** 全仓表资产数（资产漏斗金字塔统计；演示数据自洽）。 */
  tableCount: number;
}

/** 可选 TTL 生命周期策略（与 V0 `layering-manager` 对齐）。 */
export const TTL_OPTIONS = [
  '30天滚动清理',
  '90天滚动清理',
  '180天冷备切换',
  '365天归档',
  '永久保存',
] as const;

/** DQC 强度 → i18n key（受静态校验）。 */
export const DQC_LABEL: Record<DqcTemplate, ParseKeys> = {
  loose: 'warehouseLayer.dqcLoose',
  standard: 'warehouseLayer.dqcStandard',
  strict: 'warehouseLayer.dqcStrict',
};

/** 层带 → i18n key（卡片分组标题）。 */
export const TIER_LABEL: Record<LayerTier, ParseKeys> = {
  source: 'warehouseLayer.tierSource',
  common: 'warehouseLayer.tierCommon',
  app: 'warehouseLayer.tierApp',
};

/**
 * 预置五层（ODS / DIM / DWD / DWS / ADS），自下而上 seq=1..5；演示数据全脱敏。
 * 对齐 OneData 分层语义：ODS 允许脏数据、短 TTL → DWD 必清洗 → DWS 必降维聚合 → ADS 对外强阻断。
 */
export const WAREHOUSE_LAYERS: WarehouseLayerRow[] = [
  {
    code: 'ODS',
    name: '操作数据层',
    seq: 1,
    tier: 'source',
    prefix: 'ods_',
    ttl: '30天滚动清理',
    dqc: 'loose',
    duty: '原样镜像业务库，不做清洗。允许脏数据以保留现场、可追溯、可回滚，仅作中转缓冲。',
    description: '贴源同步层：业务库 / 日志 / 消息的原始落地，结构与来源一致。',
    tableCount: 326,
  },
  {
    code: 'DIM',
    name: '公共维度层',
    seq: 2,
    tier: 'common',
    prefix: 'dim_',
    ttl: '永久保存',
    dqc: 'standard',
    duty: '一致性维度的唯一出处，统一对外口径，杜绝同维多版本。',
    description: '公共维度层：跨主题复用的标准维度表，维度建模的星型核心。',
    tableCount: 88,
  },
  {
    code: 'DWD',
    name: '明细数据层',
    seq: 3,
    tier: 'common',
    prefix: 'dwd_',
    ttl: '365天归档',
    dqc: 'standard',
    duty: '清洗规范后的最细粒度事实明细，必须落标清洗，一个业务过程对应一张明细事实表。',
    description: '明细事实层：清洗、脱敏、维度退化后的原子事实，公共层复用基石。',
    tableCount: 214,
  },
  {
    code: 'DWS',
    name: '汇总数据层',
    seq: 4,
    tier: 'common',
    prefix: 'dws_',
    ttl: '180天冷备切换',
    dqc: 'strict',
    duty: '按主题域降维聚合的公共汇总宽表，必须降维聚合，禁止本地新建度量。',
    description: '汇总数据层：面向主题的多周期聚合宽表，复用原子指标口径。',
    tableCount: 147,
  },
  {
    code: 'ADS',
    name: '应用数据层',
    seq: 5,
    tier: 'app',
    prefix: 'ads_',
    ttl: '90天滚动清理',
    dqc: 'strict',
    duty: '面向应用场景的结果集，对外消费强阻断：未过 DQC SLA 不放行。',
    description: '应用数据层：直供报表 / API / 大屏的轻量结果表，挂载消费集市。',
    tableCount: 79,
  },
];
