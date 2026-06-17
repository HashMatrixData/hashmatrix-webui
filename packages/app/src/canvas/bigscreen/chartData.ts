/** 大屏图表 demo 数据（脱敏：通用月度计数，无真实业务含义）。 */
export interface TrendPoint {
  month: string;
  value: number;
}

export const TREND_DATA: TrendPoint[] = [
  { month: '2024-01', value: 120 },
  { month: '2024-02', value: 132 },
  { month: '2024-03', value: 101 },
  { month: '2024-04', value: 134 },
  { month: '2024-05', value: 190 },
  { month: '2024-06', value: 230 },
  { month: '2024-07', value: 210 },
  { month: '2024-08', value: 182 },
];
