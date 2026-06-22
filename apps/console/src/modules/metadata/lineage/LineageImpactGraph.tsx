import { useEffect, useRef } from 'react';
import { Graph } from '@antv/g6';
import { useBrandStore } from '@hashmatrix/brand';
import { useThemeStore } from '@hashmatrix/theme';
import type { LineageGraphData } from '@/mocks/lineage';

interface LineageImpactGraphProps {
  data: LineageGraphData;
  focusId: string;
  impactedIds: string[];
  height?: number;
}

type NodeKind = 'focus' | 'impacted' | 'normal';
const IMPACTED_COLOR = '#fa8c16';

/**
 * 血缘 + 影响分析图（G6，#15）：焦点节点用品牌强调色描边，下游受影响节点/边用橙色高亮。
 * 焦点/影响集/品牌/明暗变化时重建图以重新着色（沿用 LineageGraph 的 StrictMode 安全销毁）。
 */
export function LineageImpactGraph({ data, focusId, impactedIds, height = 380 }: LineageImpactGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const accent = useBrandStore((s) => s.brand.colorSecondary);
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dark = mode === 'dark';
    const nodeFill = dark ? '#1f1f1f' : '#ffffff';
    const text = dark ? '#e6e6e6' : '#1f1f1f';
    const normalStroke = dark ? '#434343' : '#d9d9d9';
    const impacted = new Set(impactedIds);
    const inPath = (id: string) => id === focusId || impacted.has(id);
    const kindOf = (id: string): NodeKind =>
      id === focusId ? 'focus' : impacted.has(id) ? 'impacted' : 'normal';

    const graph = new Graph({
      container,
      autoResize: true,
      background: dark ? '#141414' : '#fafafa',
      data: {
        nodes: data.nodes.map((n) => ({
          id: n.id,
          style: { x: n.x, y: n.y },
          data: { label: n.label, kind: kindOf(n.id) },
        })),
        edges: data.edges.map((e) => ({
          source: e.source,
          target: e.target,
          data: { impacted: inPath(e.source) && impacted.has(e.target) },
        })),
      },
      node: {
        type: 'rect',
        style: {
          size: [150, 40],
          radius: 6,
          fill: nodeFill,
          stroke: (d: { data?: { kind?: NodeKind } }) =>
            d.data?.kind === 'focus' ? accent : d.data?.kind === 'impacted' ? IMPACTED_COLOR : normalStroke,
          lineWidth: (d: { data?: { kind?: NodeKind } }) => (d.data?.kind === 'normal' ? 1 : 2.5),
          labelText: (d: { data?: { label?: string } }) => d.data?.label ?? '',
          labelFill: text,
          labelPlacement: 'center',
          labelFontSize: 12,
        },
      },
      edge: {
        type: 'polyline',
        style: {
          stroke: (d: { data?: { impacted?: boolean } }) => (d.data?.impacted ? IMPACTED_COLOR : normalStroke),
          lineWidth: (d: { data?: { impacted?: boolean } }) => (d.data?.impacted ? 2 : 1.5),
          endArrow: true,
          router: { type: 'orth' },
        },
      },
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
    });

    const rendered = graph.render();
    return () => {
      void Promise.resolve(rendered)
        .catch(() => undefined)
        .finally(() => graph.destroy());
    };
  }, [data, focusId, impactedIds, accent, mode]);

  return <div ref={containerRef} data-testid="lineage-impact-graph" style={{ width: '100%', height }} />;
}
