/** 竖排侨批正文：按信纸可用宽高自动缩字号、分列，避免溢出纸面 */

const COL_GAP_PX = 16;

export type VerticalLetterLayout = {
  fontSize: number;
  lineHeight: number;
  charsPerColumn: number;
  columns: string[][];
};

function splitColumns(chars: string[], charsPerColumn: number): string[][] {
  const columns: string[][] = [];
  for (let i = 0; i < chars.length; i += charsPerColumn) {
    columns.push(chars.slice(i, i + charsPerColumn));
  }
  return columns.length ? columns : [['　']];
}

export function layoutVerticalLetterText(
  content: string,
  bodyWidthPx: number,
  bodyHeightPx: number
): VerticalLetterLayout {
  const normalized = content.replace(/\r\n|\r|\n/g, '').trim();
  const chars = normalized.length ? [...normalized] : ['　'];

  let fontSize = 26;
  const lineHeight = 1.68;
  const minFontSize = 14;

  while (fontSize >= minFontSize) {
    const charsPerColumn = Math.max(
      10,
      Math.floor(bodyHeightPx / (fontSize * lineHeight))
    );
    const columnCount = Math.ceil(chars.length / charsPerColumn);
    const columnWidth = fontSize * 1.15;
    const totalWidth =
      columnCount * columnWidth + Math.max(0, columnCount - 1) * COL_GAP_PX;

    if (totalWidth <= bodyWidthPx || fontSize === minFontSize) {
      return {
        fontSize,
        lineHeight,
        charsPerColumn,
        columns: splitColumns(chars, charsPerColumn),
      };
    }
    fontSize -= 1;
  }

  const charsPerColumn = Math.max(
    10,
    Math.floor(bodyHeightPx / (minFontSize * lineHeight))
  );
  return {
    fontSize: minFontSize,
    lineHeight,
    charsPerColumn,
    columns: splitColumns(chars, charsPerColumn),
  };
}
