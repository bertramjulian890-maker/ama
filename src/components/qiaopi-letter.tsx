'use client';

import { forwardRef, useMemo } from 'react';
import { layoutVerticalLetterText } from '@/lib/qiaopi-letter-layout';

export const QIAOPI_LETTER_WIDTH_PX = 880;
export const QIAOPI_LETTER_HEIGHT_PX = 1240;

const BODY_TOP_PX = 120;
const BODY_SIDE_PX = 80;
const BODY_BOTTOM_RESERVE_PX = 200;
const BODY_WIDTH_PX = QIAOPI_LETTER_WIDTH_PX - BODY_SIDE_PX * 2;
const RECEIVER_COLUMN_RESERVE_PX = 56;
const BODY_TEXT_WIDTH_PX = BODY_WIDTH_PX - RECEIVER_COLUMN_RESERVE_PX;
const BODY_HEIGHT_PX =
  QIAOPI_LETTER_HEIGHT_PX - BODY_TOP_PX - BODY_BOTTOM_RESERVE_PX;
const COL_GAP_PX = 16;

export interface QiaopiLetterProps {
  receiverTitle: string;
  content: string;
  senderName: string;
  republicYear: string;
  location: string;
}

const QiaopiLetter = forwardRef<HTMLDivElement, QiaopiLetterProps>(
  ({ receiverTitle, content, senderName, republicYear, location }, ref) => {
    const bodyLayout = useMemo(
      () =>
        layoutVerticalLetterText(content, BODY_TEXT_WIDTH_PX, BODY_HEIGHT_PX),
      [content]
    );

    const senderLine = senderName.trim()
      ? `${senderName.trim()} 敬上`
      : '敬上';
    const locationLine = location.trim() ? `于 ${location.trim()}` : '';

    return (
      <div
        ref={ref}
        className="qiaopi-letter"
        style={{
          width: QIAOPI_LETTER_WIDTH_PX,
          height: QIAOPI_LETTER_HEIGHT_PX,
          position: 'relative',
          backgroundColor: '#f3ead8',
          backgroundImage: `
            linear-gradient(to right, rgba(120, 78, 38, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(120, 78, 38, 0.03) 1px, transparent 1px),
            radial-gradient(ellipse at 28% 18%, rgba(139, 90, 43, 0.07) 0%, transparent 52%),
            radial-gradient(ellipse at 72% 82%, rgba(139, 90, 43, 0.05) 0%, transparent 45%)
          `,
          backgroundSize: '22px 22px, 22px 22px, 100% 100%, 100% 100%',
          boxShadow: 'inset 0 0 120px rgba(120, 78, 38, 0.06)',
          fontFamily: '"Noto Serif SC", "Songti SC", "SimSun", serif',
          overflow: 'hidden',
          color: '#3d2914',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: '22px',
            border: '1.5px solid rgba(120, 78, 38, 0.55)',
            boxShadow:
              'inset 0 0 0 5px #f3ead8, inset 0 0 0 6.5px rgba(120, 78, 38, 0.45)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: BODY_TOP_PX,
            left: BODY_SIDE_PX,
            right: BODY_SIDE_PX,
            bottom: BODY_BOTTOM_RESERVE_PX,
            display: 'flex',
            flexDirection: 'row-reverse',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: COL_GAP_PX,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              writingMode: 'vertical-rl',
              fontSize: Math.min(22, bodyLayout.fontSize + 2),
              lineHeight: 1.75,
              letterSpacing: '0.2em',
              fontWeight: 600,
              color: '#4a3726',
              flexShrink: 0,
            }}
          >
            {receiverTitle.trim() || '（收信人称谓）'}：
          </div>

          {bodyLayout.columns.map((col, colIndex) => (
            <div
              key={colIndex}
              style={{
                writingMode: 'vertical-rl',
                fontSize: bodyLayout.fontSize,
                lineHeight: bodyLayout.lineHeight,
                letterSpacing: '0.12em',
                color: '#3d2914',
                flexShrink: 0,
              }}
            >
              {col.join('')}
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            left: BODY_SIDE_PX,
            right: BODY_SIDE_PX,
            bottom: 52,
            height: 132,
            borderTop: '1px solid rgba(120, 78, 38, 0.28)',
            display: 'flex',
            flexDirection: 'row-reverse',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            gap: 28,
            paddingTop: 20,
          }}
        >
          <div
            style={{
              writingMode: 'vertical-rl',
              fontSize: 20,
              lineHeight: 1.65,
              letterSpacing: '0.18em',
              color: '#4a3726',
              fontWeight: 600,
            }}
          >
            {senderLine}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row-reverse',
              gap: 20,
              alignItems: 'flex-end',
            }}
          >
            <div
              style={{
                writingMode: 'vertical-rl',
                fontSize: 17,
                lineHeight: 1.6,
                letterSpacing: '0.1em',
                color: '#6b5340',
              }}
            >
              {republicYear}
            </div>
            {locationLine ? (
              <div
                style={{
                  writingMode: 'vertical-rl',
                  fontSize: 17,
                  lineHeight: 1.6,
                  letterSpacing: '0.1em',
                  color: '#6b5340',
                }}
              >
                {locationLine}
              </div>
            ) : null}
          </div>
        </div>

        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: '42%',
            width: '1px',
            height: '100%',
            background:
              'linear-gradient(to bottom, transparent, rgba(120, 78, 38, 0.12) 22%, rgba(120, 78, 38, 0.08) 78%, transparent)',
            pointerEvents: 'none',
          }}
        />
      </div>
    );
  }
);

QiaopiLetter.displayName = 'QiaopiLetter';

export default QiaopiLetter;
