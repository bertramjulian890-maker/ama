/**
 * 竖排布局 —— 固定行框模型：
 * - 行框固定 FIXED_GRID_COLS 列（信纸模板）
 * - 字号根据文字多少自适应，保证文字不超出 FIXED_GRID_COLS 列
 * - 实际文字列数 ≤ FIXED_GRID_COLS；剩余列为空（行框照样渲染）
 */

export const FIXED_GRID_COLS = 8;          // 固定行框列数

const MAX_FONT_SIZE = 50;
const MIN_FONT_SIZE = 14;
const CELL_HEIGHT_RATIO = 1.18;            // 每字占格高 ≈ fontSize × 此值
const CELL_WIDTH_RATIO = 0.80;             // fontSize ≤ cellWidth × 此值

export type VerticalLetterLayout = {
  fontSize: number;
  cellWidth: number;
  charsPerColumn: number;
  columns: string[][];
};

function splitColumns(chars: string[], perCol: number): string[][] {
  const cols: string[][] = [];
  for (let i = 0; i < chars.length; i += perCol) {
    cols.push(chars.slice(i, i + perCol));
  }
  return cols.length ? cols : [['　']];
}

export function layoutVerticalLetterText(
  content: string,
  bodyWidthPx: number,
  bodyHeightPx: number,
  options?: { contentGridCols?: number }
): VerticalLetterLayout {
  const normalized = content.replace(/\r\n|\r|\n/g, '').trim();
  const chars = normalized.length ? [...normalized] : ['　'];
  const gridCols = options?.contentGridCols ?? FIXED_GRID_COLS;

  const cellWidth = Math.floor(bodyWidthPx / FIXED_GRID_COLS);

  // 最少每列需要的字数（使文字不超过可用列数）
  const minCharsPerCol = Math.max(1, Math.ceil(chars.length / gridCols));

  // 字号：受列高和格宽双重约束
  const fsByHeight = Math.floor(bodyHeightPx / (minCharsPerCol * CELL_HEIGHT_RATIO));
  const fsByWidth = Math.floor(cellWidth * CELL_WIDTH_RATIO);
  const fontSize = Math.max(
    MIN_FONT_SIZE,
    Math.min(MAX_FONT_SIZE, fsByHeight, fsByWidth)
  );

  // 实际每列字数（字号确定后按高度算）
  const charsPerColumn = Math.max(
    1,
    Math.floor(bodyHeightPx / (fontSize * CELL_HEIGHT_RATIO))
  );

  return {
    fontSize,
    cellWidth,
    charsPerColumn,
    columns: splitColumns(chars, charsPerColumn),
  };
}
