import { useEffect, useRef } from 'react';
import { Chart } from '@antv/g2';
import { useBrandStore } from '@/brand';
import { TREND_DATA } from './chartData';

/**
 * 大屏趋势图（G2，DoD #6）。系列色取品牌强调色；大屏固定暗底主题。
 * 品牌变化时重建以重新着色。
 */
export function TrendChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const colorSecondary = useBrandStore((s) => s.brand.colorSecondary);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const accent = colorSecondary;

    const chart = new Chart({ container, autoFit: true, theme: 'classicDark' });
    chart.data(TREND_DATA);
    chart
      .line()
      .encode('x', 'month')
      .encode('y', 'value')
      .style('stroke', accent)
      .style('lineWidth', 3)
      .axis('x', { title: false })
      .axis('y', { title: false });
    chart.point().encode('x', 'month').encode('y', 'value').style('fill', accent).style('r', 4);

    // 延迟到 render 结算后再 destroy（StrictMode 双调用竞态防护，同 LineageGraph）。
    const rendered = chart.render();
    return () => {
      void Promise.resolve(rendered)
        .catch(() => undefined)
        .finally(() => chart.destroy());
    };
  }, [colorSecondary]);

  return <div ref={containerRef} data-testid="trend-chart" style={{ width: '100%', height: '100%' }} />;
}
