/**
 * 系统中文字体栈优先（零版权风险、信创离线友好）。
 * 客户自备商用字体时，通过 brand.fontFamily 前置注入（见白标引擎 §4 字体槽位）。
 */
export const SYSTEM_FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', " +
  "'Microsoft YaHei', 'Source Han Sans SC', 'Noto Sans CJK SC', 'WenQuanYi Micro Hei', " +
  'Arial, sans-serif';

/** 拼接客户自备字体（可选）到系统字体栈之前。 */
export function composeFontFamily(customFontFamily?: string): string {
  const custom = customFontFamily?.trim();
  return custom ? `${custom}, ${SYSTEM_FONT_STACK}` : SYSTEM_FONT_STACK;
}
