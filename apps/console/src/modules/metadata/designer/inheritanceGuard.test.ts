import { describe, expect, it } from 'vitest';
import type { TypeDef } from '@/mocks/typedefs';
import { wouldFormInheritanceCycle } from './inheritanceGuard';

/** 极简 TypeDef 构造（只关心 name + superTypes）。 */
const td = (name: string, superTypes: string[] = []): TypeDef => ({
  name,
  displayName: name,
  category: 'ENTITY',
  superTypes,
  scope: 'TENANT',
  status: 'DRAFT',
  version: 1,
  attributeDefs: [],
  updatedAt: '2026-06-22T00:00:00.000Z',
});

describe('wouldFormInheritanceCycle', () => {
  it('自环：parent === child', () => {
    expect(wouldFormInheritanceCycle([td('A')], 'A', 'A')).toBe(true);
  });

  it('直接环：B 已继承 A，再让 A 继承 B', () => {
    const defs = [td('A'), td('B', ['A'])];
    expect(wouldFormInheritanceCycle(defs, 'A', 'B')).toBe(true);
  });

  it('间接环：C 经 B 继承 A，再让 A 继承 C', () => {
    const defs = [td('A'), td('B', ['A']), td('C', ['B'])];
    expect(wouldFormInheritanceCycle(defs, 'A', 'C')).toBe(true);
  });

  it('合法非环：放行', () => {
    const defs = [td('Base'), td('Mid', ['Base'])];
    expect(wouldFormInheritanceCycle(defs, 'Leaf', 'Mid')).toBe(false);
    expect(wouldFormInheritanceCycle([...defs, td('Leaf')], 'Leaf', 'Base')).toBe(false);
  });

  it('脏数据已成环：不爆栈、安全返回', () => {
    const defs = [td('X', ['Y']), td('Y', ['X'])]; // 已存在 X↔Y 环
    expect(() => wouldFormInheritanceCycle(defs, 'Z', 'X')).not.toThrow();
    expect(wouldFormInheritanceCycle(defs, 'Z', 'X')).toBe(false);
  });
});
