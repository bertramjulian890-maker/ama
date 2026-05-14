'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toPng } from 'html-to-image';
import QiaopiLetter from '@/components/qiaopi-letter';
import { Button } from '@/components/ui/button';
import {
  QIAOPI_PRINT_STORAGE_KEY,
  type QiaopiPrintPayload,
} from '@/lib/qiaopi-print-payload';
import { MOVIE_CINEMA_BRAND } from '@/lib/qiaopi-ui-constants';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import './letter-print.css';

const movieLine =
  process.env.NEXT_PUBLIC_QIAOPI_MOVIE_LINE ??
  '《给阿嬷的情书》· 影院主题互动呈现';

function readPayload(): { data: QiaopiPrintPayload | null; error: string | null } {
  try {
    const raw = sessionStorage.getItem(QIAOPI_PRINT_STORAGE_KEY);
    if (!raw) return { data: null, error: '未找到信笺数据。请返回首页完成转写后，点击「寄出」生成。' };
    return { data: JSON.parse(raw) as QiaopiPrintPayload, error: null };
  } catch {
    return { data: null, error: '信笺数据无效，请返回首页重试。' };
  }
}

export default function QiaopiLetterPage() {
  const router = useRouter();
  const letterRef = useRef<HTMLDivElement>(null);
  // 同步读取 sessionStorage，避免"载入中"→"信笺"的背景闪烁
  const [{ data, error }] = useState<{ data: QiaopiPrintPayload | null; error: string | null }>(readPayload);
  const [isPngExporting, setIsPngExporting] = useState(false);

  const exportPng = useCallback(async () => {
    if (!letterRef.current || !data) return;
    setIsPngExporting(true);
    try {
      const dataUrl = await toPng(letterRef.current, {
        pixelRatio: 2,
        backgroundColor: '#d8bc8a',
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${data.senderName || '侨批'}-${data.republicYearDisplay}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert('导出 PNG 失败，请重试。');
    } finally {
      setIsPngExporting(false);
    }
  }, [data]);

  if (error || !data) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-stone-100 px-6 font-serif text-amber-900">
        <p className="max-w-sm text-center leading-relaxed">
          {error ?? '未找到信笺数据。请返回首页完成转写后，点击「寄出」生成。'}
        </p>
        <Button className="mt-6" variant="outline" onClick={() => router.push('/')}>
          返回首页
        </Button>
      </div>
    );
  }

  return (
    <div className="qiaopi-print-page flex h-[100dvh] flex-col overflow-hidden print:h-auto print:overflow-visible">
      <div className="no-print sticky top-0 z-10 shrink-0 px-3 py-3">
        <div className="qiaopi-content-width flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-amber-700 font-serif text-amber-900"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            返回修改
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isPngExporting}
            className="bg-amber-800 font-serif text-amber-50 hover:bg-amber-900"
            onClick={exportPng}
          >
            {isPngExporting ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-1 h-4 w-4" />
            )}
            导出 PNG
          </Button>
        </div>
      </div>

      <div className="qiaopi-letter-stage px-2 pb-3 print:block print:px-0 print:pb-0">
        <div className="print-letter-wrap">
          <div className="letter-screen-scale">
            <QiaopiLetter
              ref={letterRef}
              receiverTitle={data.receiverTitle}
              content={data.content}
              senderName={data.senderName}
              republicYear={data.republicYearDisplay}
              location={data.location}
            />
          </div>
        </div>

        <footer className="print-brand-footer qiaopi-content-width mt-3 w-full shrink-0 border-t border-amber-900/25 px-4 pb-4 pt-3 text-center font-serif text-sm text-amber-900/80 print:mt-4 print:pb-0 print:text-xs">
          <div className="font-medium tracking-widest text-amber-900">
            {MOVIE_CINEMA_BRAND}
          </div>
          <div className="mt-1 text-amber-800/90">{movieLine}</div>
        </footer>
      </div>
    </div>
  );
}
