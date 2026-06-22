import type { TypeDef } from '@/mocks/typedefs';

/**
 * 给 child 加 parent 作为 superType 是否会形成循环继承（A1 连线门控）。
 * = parent === child（自环）或 parent 已（传递地）继承 child。
 * `seen` 防脏数据本就成环时无限递归 / 爆栈。纯函数，便于单测。
 */
export function wouldFormInheritanceCycle(
  typeDefs: TypeDef[],
  child: string,
  parent: string,
): boolean {
  if (parent === child) return true;
  const byName = new Map(typeDefs.map((t) => [t.name, t]));
  const seen = new Set<string>();
  const reachesChild = (from: string): boolean => {
    if (seen.has(from)) return false;
    seen.add(from);
    for (const p of byName.get(from)?.superTypes ?? []) {
      if (p === child || reachesChild(p)) return true;
    }
    return false;
  };
  return reachesChild(parent);
}
