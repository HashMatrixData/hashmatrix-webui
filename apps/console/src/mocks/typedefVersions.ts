/**
 * 元类版本记录（TypeDefVersion）mock —— 生命周期/版本前端面（governance Epic #1 / 子 #8）。
 *
 * 草稿→发布 + vN 变更记录。后端 post-M1，前端先行 mock。
 * 红线：摘要为通用变更描述，无任何真实甲方/业务可识别信息。
 */
import type { TypeStatus } from './typedefs';

export interface TypeDefVersion {
  version: number;
  status: TypeStatus;
  /** ISO 时间，确定性常量（无随机）。 */
  changedAt: string;
  summary: string;
}

const INITIAL_VERSIONS: Record<string, TypeDefVersion[]> = {
  DataAsset: [
    { version: 1, status: 'PUBLISHED', changedAt: '2026-04-01T08:00:00.000Z', summary: '初始发布' },
    { version: 2, status: 'PUBLISHED', changedAt: '2026-05-01T08:00:00.000Z', summary: '新增 owner 默认值' },
  ],
  BusinessTerm: [
    { version: 1, status: 'DRAFT', changedAt: '2026-06-10T08:00:00.000Z', summary: '创建草稿' },
  ],
};

const clone = (m: Record<string, TypeDefVersion[]>): Record<string, TypeDefVersion[]> =>
  structuredClone(m);

export const TYPEDEF_VERSIONS: Record<string, TypeDefVersion[]> = clone(INITIAL_VERSIONS);

/** 还原到初始种子（供 story play 隔离）。 */
export function resetTypedefVersions(): void {
  for (const key of Object.keys(TYPEDEF_VERSIONS)) delete TYPEDEF_VERSIONS[key];
  Object.assign(TYPEDEF_VERSIONS, clone(INITIAL_VERSIONS));
}

/** 追加一条版本记录（发布时调用）。 */
export function recordVersion(name: string, record: TypeDefVersion): void {
  (TYPEDEF_VERSIONS[name] ??= []).push(record);
}
