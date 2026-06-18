import { useEffect, useRef } from 'react';
import { Graph } from '@antv/x6';
import { useBrandStore } from '@hashmatrix/brand';
import { useThemeStore } from '@hashmatrix/theme';
import { getCanvasTheme, type CanvasTheme } from '../canvasTheme';
import { DAG_NODES, DAG_EDGES, type TaskStatus } from './dagData';

/** 任务状态 → 固定语义色（不随品牌变化）。 */
function statusColor(status: TaskStatus, theme: CanvasTheme): string {
  switch (status) {
    case 'success':
      return theme.success;
    case 'running':
      return theme.warning;
    case 'failed':
      return theme.error;
    default:
      return theme.nodeStroke;
  }
}

/**
 * DAG 编排 demo（X6，DoD #5）。选中任务用品牌强调色描边；
 * 任务状态用固定语义色，结构色固定。品牌/明暗变化时重建。
 */
export function DagGraph({ height = 320 }: { height?: number }) {
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
      background: { color: theme.background },
      grid: { visible: true, type: 'dot', size: 12, args: { color: theme.edge } },
      panning: true,
      mousewheel: { enabled: true, modifiers: ['ctrl', 'meta'] },
      interacting: { nodeMovable: true },
    });

    DAG_NODES.forEach((n) => {
      const stroke = n.selected ? theme.accent : statusColor(n.status, theme);
      graph.addNode({
        id: n.id,
        x: n.x,
        y: n.y,
        width: 140,
        height: 44,
        label: n.label,
        attrs: {
          body: { fill: theme.nodeFill, stroke, strokeWidth: n.selected ? 2.5 : 1.5, rx: 6, ry: 6 },
          label: { fill: theme.text, fontSize: 12 },
        },
      });
    });

    DAG_EDGES.forEach((e) => {
      graph.addEdge({
        source: { cell: e.source },
        target: { cell: e.target },
        attrs: { line: { stroke: theme.edge, strokeWidth: 1.5, targetMarker: { name: 'block', size: 6 } } },
        connector: { name: 'rounded' },
        router: { name: 'manhattan' },
      });
    });

    graph.zoomToFit({ padding: 24, maxScale: 1 });

    return () => {
      graph.dispose();
    };
  }, [colorSecondary, mode]);

  return <div ref={containerRef} data-testid="dag-graph" style={{ width: '100%', height }} />;
}
