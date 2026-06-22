/**
 * 元模型一致性校验（mock）—— 一致性校验门控前端面（governance Epic #1 / 子 #9）。
 *
 * 扫描当前 TYPEDEFS + RELATIONSHIPS，检测：编码唯一 / superType 父类存在性 /
 * 循环继承（DFS 回边）/ 关系端点完整性。后端 post-M1，前端先行 mock。
 * issue 只携带规则 + 目标 + 具体值（detail，语言中立），文案由 UI 经 i18n 渲染。
 */
import { TYPEDEFS } from './typedefs';
import { RELATIONSHIPS } from './relationships';

export type ValidationSeverity = 'ERROR' | 'WARNING';
export type ValidationRule = 'UNIQUE_CODE' | 'SUPER_EXISTS' | 'NO_CYCLE' | 'REL_ENDPOINT';

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  rule: ValidationRule;
  /** 出问题的元类/关系编码。 */
  target: string;
  /** 具体值（缺失的父类名 / 循环路径 / 缺失端点元类），语言中立。 */
  detail: string;
}

export interface ValidationReport {
  issues: ValidationIssue[];
  summary: { errors: number; warnings: number; checked: number };
  /** 各规则命中数（0 即通过）。 */
  ruleHits: Record<ValidationRule, number>;
}

/** superType 继承图循环检测（DFS 三色 + 回边）。返回各循环路径。 */
function detectSuperTypeCycles(): string[][] {
  const byName = new Map(TYPEDEFS.map((d) => [d.name, d]));
  const WHITE = 0;
  const GRAY = 1;
  const color = new Map<string, number>();
  const stack: string[] = [];
  const cycles: string[][] = [];

  const dfs = (name: string): void => {
    color.set(name, GRAY);
    stack.push(name);
    for (const parent of byName.get(name)?.superTypes ?? []) {
      if (!byName.has(parent)) continue; // 悬空父类由 SUPER_EXISTS 规则单独报
      const c = color.get(parent) ?? WHITE;
      if (c === GRAY) {
        const idx = stack.indexOf(parent);
        cycles.push([...stack.slice(idx), parent]);
      } else if (c === WHITE) {
        dfs(parent);
      }
    }
    stack.pop();
    color.set(name, 2);
  };

  for (const d of TYPEDEFS) {
    if ((color.get(d.name) ?? WHITE) === WHITE) dfs(d.name);
  }
  return cycles;
}

export function validateModel(): ValidationReport {
  const issues: ValidationIssue[] = [];
  const names = new Set(TYPEDEFS.map((d) => d.name));

  // 编码唯一。
  const seen = new Set<string>();
  for (const d of TYPEDEFS) {
    if (seen.has(d.name)) {
      issues.push({ id: `dup:${d.name}`, severity: 'ERROR', rule: 'UNIQUE_CODE', target: d.name, detail: d.name });
    }
    seen.add(d.name);
  }

  // superType 父类存在性。
  for (const d of TYPEDEFS) {
    for (const parent of d.superTypes) {
      if (!names.has(parent)) {
        issues.push({
          id: `super:${d.name}:${parent}`,
          severity: 'ERROR',
          rule: 'SUPER_EXISTS',
          target: d.name,
          detail: parent,
        });
      }
    }
  }

  // 循环继承。
  for (const cycle of detectSuperTypeCycles()) {
    issues.push({
      id: `cycle:${cycle.join('>')}`,
      severity: 'ERROR',
      rule: 'NO_CYCLE',
      target: cycle[0],
      detail: cycle.join(' → '),
    });
  }

  // 关系端点完整性。
  for (const r of RELATIONSHIPS) {
    for (const end of [r.end1, r.end2]) {
      if (!names.has(end.typeName)) {
        issues.push({
          id: `rel:${r.name}:${end.typeName}`,
          severity: 'ERROR',
          rule: 'REL_ENDPOINT',
          target: r.name,
          detail: end.typeName,
        });
      }
    }
  }

  const ruleHits: Record<ValidationRule, number> = {
    UNIQUE_CODE: 0,
    SUPER_EXISTS: 0,
    NO_CYCLE: 0,
    REL_ENDPOINT: 0,
  };
  for (const i of issues) ruleHits[i.rule] += 1;

  return {
    issues,
    summary: {
      errors: issues.filter((i) => i.severity === 'ERROR').length,
      warnings: issues.filter((i) => i.severity === 'WARNING').length,
      checked: TYPEDEFS.length + RELATIONSHIPS.length,
    },
    ruleHits,
  };
}
