/**
 * 画布主题（spec §4 画布消费决策）：
 * **强调色随品牌**（由调用方传入当前品牌辅色），结构色与语义状态色**固定**以保证可读性。
 */
export interface CanvasTheme {
  /** 强调/选中/高亮——唯一随品牌变化的色 */
  accent: string;
  /** 结构色：节点底/描边/文字/边线（随明暗固定取值） */
  nodeFill: string;
  nodeStroke: string;
  edge: string;
  text: string;
  /** 语义状态色：固定，不随品牌变化 */
  success: string;
  warning: string;
  error: string;
  /** 画布背景 */
  background: string;
}

function isDark(): boolean {
  return typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark';
}

/** 传入当前品牌辅色作为强调色（显式依赖，避免从 DOM 回读的时序耦合）。 */
export function getCanvasTheme(accent: string): CanvasTheme {
  const dark = isDark();
  return {
    accent,
    nodeFill: dark ? '#1f1f1f' : '#ffffff',
    nodeStroke: dark ? '#434343' : '#d9d9d9',
    edge: dark ? '#595959' : '#bfbfbf',
    text: dark ? '#e6e6e6' : '#1f1f1f',
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    background: dark ? '#141414' : '#fafafa',
  };
}
