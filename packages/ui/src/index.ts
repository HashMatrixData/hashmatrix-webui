// 设计系统：通用控件 + AntV 画布组件 + 共享 hooks。两 app 共享。
export { LanguageSwitch, ThemeSwitch, BrandSwitch, RoleSwitcher } from './controls';
export { LineageGraph } from './canvas/lineage/LineageGraph';
export { DagGraph } from './canvas/dag/DagGraph';
export { ScaleContainer } from './canvas/bigscreen/ScaleContainer';
export { TrendChart } from './canvas/bigscreen/TrendChart';
export { getCanvasTheme, type CanvasTheme } from './canvas/canvasTheme';
export { useContainerSize, type Size } from './hooks/useContainerSize';
