'use client';

import { forwardRef, useMemo } from 'react';
import * as OpenCC from 'opencc-js';
import { layoutVerticalLetterText, FIXED_GRID_COLS } from '@/lib/qiaopi-letter-layout';

export const QIAOPI_LETTER_WIDTH_PX = 880;
export const QIAOPI_LETTER_HEIGHT_PX = 1240;

const BODY_TOP_PX = 98;
const BODY_SIDE_PX = 102;
const BODY_BOTTOM_PX = 88;
const BODY_WIDTH_PX = QIAOPI_LETTER_WIDTH_PX - BODY_SIDE_PX * 2; // 676
const BODY_HEIGHT_PX = QIAOPI_LETTER_HEIGHT_PX - BODY_TOP_PX - BODY_BOTTOM_PX; // 1054
const GRID_PAD = 10; // 行框超出文字区的内边距

// 做旧红色：偏褐暗红，半透明
const GRID_COLOR = 'rgba(148, 36, 16, 0.46)';

const toTraditional = OpenCC.Converter({ from: 'cn', to: 'tw' });

/** 确定性微旋转，模拟手写不规则感 */
function charRotation(colIdx: number, charIdx: number): number {
  return (((colIdx * 7 + charIdx * 13) % 9) - 4) * 0.30;
}

export interface QiaopiLetterProps {
  receiverTitle: string;
  content: string;
  senderName: string;
  republicYear: string;
  location: string;
}

const QiaopiLetter = forwardRef<HTMLDivElement, QiaopiLetterProps>(
  ({ content, receiverTitle, senderName }, ref) => {
    const traditionalContent = useMemo(() => toTraditional(content), [content]);
    const salutationColumn = useMemo(() => {
      const name = receiverTitle.trim();
      return [...toTraditional(`亲爱的${name}:`)];
    }, [receiverTitle]);
    const layout = useMemo(
      () =>
        layoutVerticalLetterText(traditionalContent, BODY_WIDTH_PX, BODY_HEIGHT_PX, {
          contentGridCols: FIXED_GRID_COLS - 1,
        }),
      [traditionalContent]
    );

    const { fontSize, cellWidth, charsPerColumn, columns: bodyColumns } = layout;
    const traditionalSender = useMemo(() => toTraditional(senderName.trim() || ''), [senderName]);
    const columns = useMemo(
      () => [salutationColumn, ...bodyColumns],
      [salutationColumn, bodyColumns]
    );
    const cellH = BODY_HEIGHT_PX / charsPerColumn;

    // 行框 SVG 尺寸（文字区 + 内边距）
    const gridW = BODY_WIDTH_PX + GRID_PAD * 2;
    const gridH = BODY_HEIGHT_PX + GRID_PAD * 2;

    return (
      <div
        ref={ref}
        className="qiaopi-letter"
        style={{
          width: QIAOPI_LETTER_WIDTH_PX,
          height: QIAOPI_LETTER_HEIGHT_PX,
          position: 'relative',
          backgroundImage: 'url("/qiaopi-paper.png")',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '112% 108%',
          backgroundColor: '#d8bc8a',
          overflow: 'hidden',
          color: '#2b1d12',
          // 外阴影：柔和投影让信纸浮在背景上；内阴影：四边轻微收边
          boxShadow: [
            '0 12px 48px rgba(60, 30, 8, 0.55)',
            '0 4px 16px rgba(60, 30, 8, 0.38)',
            'inset 0 0 36px rgba(60, 30, 8, 0.18)',
          ].join(', '),
        }}
      >
        {/* ── 固定红色行框（永远渲染 FIXED_GRID_COLS 列） ── */}
        <svg
          aria-hidden
          style={{
            position: 'absolute',
            top: BODY_TOP_PX - GRID_PAD,
            left: BODY_SIDE_PX - GRID_PAD,
            width: gridW,
            height: gridH,
            overflow: 'visible',
            pointerEvents: 'none',
            filter: 'none',
            mixBlendMode: 'multiply',
          }}
        >
          {/* 外边框 */}
          <rect
            x={0.5} y={0.5}
            width={gridW - 1} height={gridH - 1}
            fill="none"
            stroke={GRID_COLOR}
            strokeWidth={2}
          />
          {/* 列分隔线：等间距，从右向左依次排开 */}
          {Array.from({ length: FIXED_GRID_COLS - 1 }, (_, i) => {
            // i=0 是最右侧第一条内分线；等宽格，间距 = cellWidth
            const x = GRID_PAD + (i + 1) * cellWidth;
            return (
              <line
                key={i}
                x1={x} y1={0}
                x2={x} y2={gridH}
                stroke={GRID_COLOR}
                strokeWidth={1.3}
              />
            );
          })}
        </svg>

        {/* ── 文字区：从右往左写，第一列在最右，空列留在左侧 ── */}
        <div
          style={{
            position: 'absolute',
            top: BODY_TOP_PX,
            // 文字块右对齐：紧贴纸张右边距，空列自然留在左侧
            right: BODY_SIDE_PX,
            width: columns.length * cellWidth,
            height: BODY_HEIGHT_PX,
            display: 'flex',
            // 从右往左排：第一列在最右
            flexDirection: 'row-reverse',
            alignItems: 'flex-start',
            overflow: 'hidden',
            mixBlendMode: 'multiply',
          }}
        >
          {columns.map((col, colIndex) => (
            <div
              key={colIndex}
              lang="zh-Hant"
              className="qiaopi-letter-text"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                // 最后一列字数不足时高度自然缩短，下方留白
                height: col.length * cellH,
                width: cellWidth,
                flexShrink: 0,
              }}
            >
              {col.map((char, charIndex) => (
                <span
                  key={charIndex}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: cellWidth,
                    height: cellH,
                    fontSize,
                    lineHeight: 1,
                    fontWeight: 400,
                    writingMode: 'vertical-rl',
                    textOrientation: 'upright',
                    color: '#180d06',
                    flexShrink: 0,
                    transform: `rotate(${charRotation(colIndex, charIndex)}deg)`,
                    filter: 'none',
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* ── 落款：寄信人姓名 + 謹上，位于左下角，传统侨批格式 ── */}
        {traditionalSender && (
          <div
            lang="zh-Hant"
            className="qiaopi-letter-text"
            style={{
              position: 'absolute',
              bottom: BODY_BOTTOM_PX + 12,
              left: BODY_SIDE_PX + cellWidth * 0.18,
              writingMode: 'vertical-rl',
              textOrientation: 'upright',
              fontSize,
              lineHeight: 1.3,
              color: '#180d06',
              mixBlendMode: 'multiply',
              letterSpacing: '0.06em',
            }}
          >
            {traditionalSender}
          </div>
        )}
      </div>
    );
  }
);

QiaopiLetter.displayName = 'QiaopiLetter';

export default QiaopiLetter;
