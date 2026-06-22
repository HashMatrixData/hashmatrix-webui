/**
 * 分类树（ClassificationNode）mock 数据 —— 分类树前端面（governance Epic #1 / 子 #6）。
 *
 * 多级分类：技术 / 业务 / 管理维度；PLATFORM 预置只读 + TENANT 私有可扩展（#10）。
 * 红线：均为通用治理分类占位，无任何真实甲方/业务可识别信息。
 */
import type { TypeScope } from './typedefs';

export interface ClassificationNode {
  /** 全路径唯一键（如 `tech.storage`）。 */
  key: string;
  /** 编码（同级唯一）。 */
  name: string;
  displayName: string;
  /** PLATFORM 预置只读 / TENANT 私有扩展。 */
  scope: TypeScope;
  description?: string;
  children?: ClassificationNode[];
}

const INITIAL_CLASSIFICATIONS: ClassificationNode[] = [
  {
    key: 'tech',
    name: 'tech',
    displayName: '技术分类',
    scope: 'PLATFORM',
    description: '按技术维度的预置分类（只读）。',
    children: [
      { key: 'tech.storage', name: 'storage', displayName: '存储', scope: 'PLATFORM' },
      { key: 'tech.compute', name: 'compute', displayName: '计算', scope: 'PLATFORM' },
    ],
  },
  {
    key: 'business',
    name: 'business',
    displayName: '业务分类',
    scope: 'PLATFORM',
    description: '按业务维度的预置分类（只读）。',
    children: [
      { key: 'business.metric', name: 'metric', displayName: '指标', scope: 'PLATFORM' },
      {
        key: 'business.tenant_ext',
        name: 'tenant_ext',
        displayName: '租户自定义示例',
        scope: 'TENANT',
        description: '租户私有扩展分类示例。',
      },
    ],
  },
  {
    key: 'management',
    name: 'management',
    displayName: '管理分类',
    scope: 'PLATFORM',
    description: '按管理维度的预置分类（只读）。',
    children: [{ key: 'management.security', name: 'security', displayName: '安全', scope: 'PLATFORM' }],
  },
];

export const CLASSIFICATIONS: ClassificationNode[] = structuredClone(INITIAL_CLASSIFICATIONS);

/** 还原到初始种子（供 story play 隔离；写接口会就地变更树）。 */
export function resetClassifications(): void {
  CLASSIFICATIONS.splice(0, CLASSIFICATIONS.length, ...structuredClone(INITIAL_CLASSIFICATIONS));
}

/** 深度优先按 key 查找节点。 */
export function findClassification(
  nodes: ClassificationNode[],
  key: string,
): ClassificationNode | null {
  for (const node of nodes) {
    if (node.key === key) return node;
    if (node.children) {
      const hit = findClassification(node.children, key);
      if (hit) return hit;
    }
  }
  return null;
}
