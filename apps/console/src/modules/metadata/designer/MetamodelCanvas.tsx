import { useEffect, useRef } from 'react';
import { Graph } from '@antv/x6';
import { useBrandStore } from '@hashmatrix/brand';
import { useThemeStore } from '@hashmatrix/theme';
import type { TypeDef } from '@/mocks/typedefs';
import type { RelationshipDef } from '@/mocks/relationships';
import { CARDINALITY_SYMBOL } from '../relationship/relationshipMeta';

interface MetamodelCanvasProps {
  typeDefs: TypeDef[];
  relationships: RelationshipDef[];
  selectedId: string | null;
  onSelectNode: (name: string | null) => void;
  onEditNode?: (name: string) => void;
  /** 点击关系边回调（关系编码）。 */
  onSelectEdge?: (name: string) => void;
  /** 一致性校验命中的元类编码，红色高亮。 */
  problemIds?: string[];
  height?: number;
}

/** 作用域 → 节点描边色（hex，X6 用）。 */
const SCOPE_STROKE: Record<TypeDef['scope'], string> = {
  PLATFORM: '#d48806',
  TENANT: '#08979c',
};
const PROBLEM_STROKE = '#ff4d4f';
/** 关系边 id 前缀（用于 edge:click 区分关系边与继承边）。 */
const REL_EDGE_PREFIX = 'rel:';

/**
 * 分层布局：列 = superType 继承深度（根在左），行 = 同层内序号（按编码定序，确定性）。
 * 跳过悬空父类；带 cycle 守卫。
 */
function computeLayout(typeDefs: TypeDef[]): Map<string, { x: number; y: number }> {
  const byName = new Map(typeDefs.map((t) => [t.name, t]));
  const depthCache = new Map<string, number>();
  const computing = new Set<string>();
  const depth = (name: string): number => {
    if (depthCache.has(name)) return depthCache.get(name)!;
    if (computing.has(name)) return 0;
    computing.add(name);
    const parents = (byName.get(name)?.superTypes ?? []).filter((p) => byName.has(p));
    const d = parents.length ? 1 + Math.max(...parents.map(depth)) : 0;
    computing.delete(name);
    depthCache.set(name, d);
    return d;
  };

  const sorted = [...typeDefs].sort((a, b) => a.name.localeCompare(b.name));
  const rowByDepth = new Map<number, number>();
  const pos = new Map<string, { x: number; y: number }>();
  for (const t of sorted) {
    const d = depth(t.name);
    const row = rowByDepth.get(d) ?? 0;
    rowByDepth.set(d, row + 1);
    pos.set(t.name, { x: d * 260 + 40, y: row * 110 + 40 });
  }
  return pos;
}

/**
 * 元模型设计画布（X6）：元类=节点，继承=虚线边，关系=带基数标签的实线边。
 * 选中节点用品牌强调色描边；点击空白清除选中；双击节点触发编辑。
 * 数据/选中/品牌/明暗变化时重建（沿用 DagGraph 的 X6 dispose 清理）。
 */
export function MetamodelCanvas({
  typeDefs,
  relationships,
  selectedId,
  onSelectNode,
  onEditNode,
  onSelectEdge,
  problemIds,
  height = 460,
}: MetamodelCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const accent = useBrandStore((s) => s.brand.colorSecondary);
  const mode = useThemeStore((s) => s.mode);

  // 建图：仅在数据/品牌/明暗变化时重建（选中高亮分离到下一个 effect，避免每次点击都重置缩放）。
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dark = mode === 'dark';
    const nodeFill = dark ? '#1f1f1f' : '#ffffff';
    const text = dark ? '#e6e6e6' : '#1f1f1f';
    const bg = dark ? '#141414' : '#fafafa';
    const inheritEdge = dark ? '#5b8ff9' : '#1677ff';
    const relEdge = '#fa8c16';

    const graph = new Graph({
      container,
      autoResize: true,
      background: { color: bg },
      grid: { visible: true, type: 'dot', size: 12, args: { color: dark ? '#303030' : '#e8e8e8' } },
      panning: true,
      mousewheel: { enabled: true, modifiers: ['ctrl', 'meta'] },
      interacting: { nodeMovable: true },
    });

    const layout = computeLayout(typeDefs);
    const present = new Set(typeDefs.map((t) => t.name));

    for (const t of typeDefs) {
      const p = layout.get(t.name) ?? { x: 40, y: 40 };
      graph.addNode({
        id: t.name,
        x: p.x,
        y: p.y,
        width: 168,
        height: 52,
        label: t.displayName,
        attrs: {
          body: { fill: nodeFill, stroke: SCOPE_STROKE[t.scope], strokeWidth: 1.5, rx: 6, ry: 6 },
          label: { fill: text, fontSize: 13 },
        },
      });
    }

    // 继承边（child → parent，虚线）。
    for (const t of typeDefs) {
      for (const parent of t.superTypes) {
        if (!present.has(parent)) continue;
        graph.addEdge({
          source: { cell: t.name },
          target: { cell: parent },
          attrs: {
            line: {
              stroke: inheritEdge,
              strokeWidth: 1.5,
              strokeDasharray: '4 3',
              targetMarker: { name: 'block', size: 7, open: true },
            },
          },
          connector: { name: 'rounded' },
          router: { name: 'manhattan' },
        });
      }
    }

    // 关系边（end1 → end2，实线 + 基数标签；id 带前缀以便点击识别）。
    for (const r of relationships) {
      if (!present.has(r.end1.typeName) || !present.has(r.end2.typeName)) continue;
      graph.addEdge({
        id: `${REL_EDGE_PREFIX}${r.name}`,
        source: { cell: r.end1.typeName },
        target: { cell: r.end2.typeName },
        label: CARDINALITY_SYMBOL[r.cardinality],
        attrs: {
          line: { stroke: relEdge, strokeWidth: 1.8, targetMarker: { name: 'block', size: 7 } },
        },
        connector: { name: 'rounded' },
        router: { name: 'manhattan' },
      });
    }

    graph.on('node:click', ({ node }) => onSelectNode(node.id));
    graph.on('blank:click', () => onSelectNode(null));
    if (onEditNode) graph.on('node:dblclick', ({ node }) => onEditNode(node.id));
    if (onSelectEdge) {
      graph.on('edge:click', ({ edge }) => {
        if (edge.id.startsWith(REL_EDGE_PREFIX)) onSelectEdge(edge.id.slice(REL_EDGE_PREFIX.length));
      });
    }

    graph.zoomToFit({ padding: 32, maxScale: 1 });
    graphRef.current = graph;

    return () => {
      graph.dispose();
      graphRef.current = null;
    };
    // accent/problemIds 不在此——选中与问题高亮属下一个 effect，不应触发整图重建。
  }, [typeDefs, relationships, mode, onSelectNode, onEditNode, onSelectEdge]);

  // 选中 + 问题高亮：就地改描边，不重建（保留用户的平移/缩放）。
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;
    const problems = new Set(problemIds);
    for (const t of typeDefs) {
      const node = graph.getCellById(t.name);
      if (!node?.isNode()) continue;
      const selected = t.name === selectedId;
      const problem = problems.has(t.name);
      node.attr('body/stroke', selected ? accent : problem ? PROBLEM_STROKE : SCOPE_STROKE[t.scope]);
      node.attr('body/strokeWidth', selected || problem ? 3 : 1.5);
    }
  }, [selectedId, problemIds, typeDefs, accent]);

  return <div ref={containerRef} data-testid="metamodel-canvas" style={{ width: '100%', height }} />;
}
