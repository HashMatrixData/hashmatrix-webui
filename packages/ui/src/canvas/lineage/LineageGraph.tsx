import { useEffect, useRef } from 'react';
import { Graph } from '@antv/g6';
import { useBrandStore } from '@hashmatrix/brand';
import { useThemeStore } from '@hashmatrix/theme';
import { getCanvasTheme } from '../canvasTheme';
import { LINEAGE_NODES, LINEAGE_EDGES } from './lineageData';

/**
 * 数据血缘 demo（G6，DoD #5）。聚焦节点用品牌强调色描边；结构色固定。
 * 品牌/明暗变化时重建图以重新着色。
 */
export function LineageGraph({ height = 320 }: { height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colorSecondary = useBrandStore((s) => s.brand.colorSecondary);
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const theme = getCanvasTheme(colorSecondary);

    const graph = new Graph({
      container,
      autoResize: true,
      background: theme.background,
      data: {
        nodes: LINEAGE_NODES.map((n) => ({
          id: n.id,
          style: { x: n.x, y: n.y },
          data: { label: n.label, focus: Boolean(n.focus) },
        })),
        edges: LINEAGE_EDGES.map((e) => ({ source: e.source, target: e.target })),
      },
      node: {
        type: 'rect',
        style: {
          size: [140, 40],
          radius: 6,
          fill: theme.nodeFill,
          stroke: (d: { data?: { focus?: boolean } }) => (d.data?.focus ? theme.accent : theme.nodeStroke),
          lineWidth: (d: { data?: { focus?: boolean } }) => (d.data?.focus ? 2.5 : 1),
          labelText: (d: { data?: { label?: string } }) => d.data?.label ?? '',
          labelFill: theme.text,
          labelPlacement: 'center',
          labelFontSize: 12,
        },
      },
      edge: {
        type: 'polyline',
        style: {
          stroke: theme.edge,
          lineWidth: 1.5,
          endArrow: true,
          router: { type: 'orth' },
        },
      },
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
    });

    // 延迟到 render 结算后再 destroy：规避 StrictMode 双调用下「异步 render 进行中即销毁」的竞态。
    const rendered = graph.render();
    return () => {
      void Promise.resolve(rendered)
        .catch(() => undefined)
        .finally(() => graph.destroy());
    };
  }, [colorSecondary, mode]);

  return <div ref={containerRef} data-testid="lineage-graph" style={{ width: '100%', height }} />;
}
