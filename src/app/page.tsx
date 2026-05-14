'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sparkles,
  Loader2,
  Send,
} from 'lucide-react';
import {
  getRepublicDate,
  LOCATION_OPTIONS,
  MOVIE_DEFAULT_LOCATION,
  MOVIE_DEFAULT_RECEIVER,
  MOVIE_DEFAULT_SENDER,
} from '@/lib/qiaopi-ui-constants';
import {
  QIAOPI_PRINT_STORAGE_KEY,
  type QiaopiPrintPayload,
} from '@/lib/qiaopi-print-payload';

function validateSendReady(
  letterText: string,
  senderName: string,
  receiverTitle: string,
  location: string
): string | null {
  if (!letterText.trim()) return '请先填写或转写正文。';
  if (!senderName.trim()) return '请填写寄信人姓名。';
  if (!receiverTitle.trim()) return '请填写收信人称呼。';
  if (!location.trim()) return '寄出地缺失，请刷新页面重试。';
  return null;
}

export default function QiaopiHomePage() {
  const router = useRouter();
  const [letterText, setLetterText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const [senderName, setSenderName] = useState('');
  const [receiverTitle, setReceiverTitle] = useState('');
  const [location, setLocation] = useState<string>(MOVIE_DEFAULT_LOCATION);
  const republicDate = getRepublicDate();

  const handleTranscribe = useCallback(async () => {
    if (!letterText.trim()) return;

    setIsTranscribing(true);
    const sourceText = letterText;
    setLetterText('');

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceText, template: 'movie' }),
      });

      if (!response.ok) {
        let msg = '转写失败';
        try {
          const j = (await response.json()) as { error?: string };
          if (j?.error) msg = j.error;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      const decoder = new TextDecoder();
      let accumulated = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data) as { content?: string };
              if (parsed.content) {
                accumulated += parsed.content;
                setLetterText(accumulated);
              }
            } catch {
              /* ignore */
            }
          }
        }
      }
    } catch (error) {
      console.error('转写错误:', error);
      setLetterText(
        error instanceof Error ? error.message : '转写失败，请稍后重试'
      );
    } finally {
      setIsTranscribing(false);
    }
  }, [letterText]);

  const handleSend = useCallback(() => {
    const err = validateSendReady(
      letterText,
      senderName,
      receiverTitle,
      location
    );
    if (err) {
      alert(err);
      return;
    }
    const payload: QiaopiPrintPayload = {
      receiverTitle: receiverTitle.trim(),
      content: letterText.trim(),
      senderName: senderName.trim(),
      republicYearDisplay: republicDate.display,
      location: location.trim(),
    };
    try {
      sessionStorage.setItem(
        QIAOPI_PRINT_STORAGE_KEY,
        JSON.stringify(payload)
      );
    } catch {
      alert('无法写入浏览器存储，请检查是否禁用 Cookie/存储。');
      return;
    }
    router.push('/letter');
  }, [
    letterText,
    senderName,
    receiverTitle,
    location,
    republicDate.display,
    router,
  ]);

  return (
    <div className="qiaopi-container min-h-[100dvh] overflow-x-hidden">
      <header className="border-b-2 border-amber-900/20 px-4 py-[clamp(1rem,3dvh,1.75rem)] text-center">
        <div className="qiaopi-content-width">
          <h1 className="font-serif text-[clamp(1.5rem,5vw,1.875rem)] tracking-wider text-amber-900">
            侨批情书
          </h1>
        </div>
      </header>

      <main className="qiaopi-page-main qiaopi-content-width">
        <div className="flex flex-col gap-[clamp(1.25rem,4dvh,2rem)]">
          <section>
            <div className="letter-paper vintage-border space-y-4 rounded-lg p-4">
              <div>
                <Label className="mb-1 block font-serif text-sm text-amber-800">
                  寄信人姓名
                </Label>
                <Input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder={MOVIE_DEFAULT_SENDER}
                  className="vintage-input h-10"
                />
              </div>
              <div>
                <Label className="mb-1 block font-serif text-sm text-amber-800">
                  收信人称呼
                </Label>
                <Input
                  value={receiverTitle}
                  onChange={(e) => setReceiverTitle(e.target.value)}
                  placeholder={MOVIE_DEFAULT_RECEIVER}
                  className="vintage-input h-10"
                />
              </div>
              <div>
                <Label className="mb-1 block font-serif text-sm text-amber-800">
                  寄出地
                </Label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="vintage-input h-10 w-full rounded-md border border-amber-300/80 bg-amber-50/50 px-3 font-serif text-amber-900"
                >
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section>
            <div className="letter-paper vintage-border rounded-lg p-4">
              <Textarea
                value={letterText}
                onChange={(e) => setLetterText(e.target.value)}
                placeholder="写下你的相思……"
                className="vintage-input min-h-[200px] resize-none border-0 bg-transparent focus:ring-0 sm:min-h-[240px]"
                disabled={isTranscribing}
              />
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                onClick={handleTranscribe}
                disabled={!letterText.trim() || isTranscribing}
                className="vintage-button w-full max-w-xs rounded-lg py-2.5 sm:w-auto sm:px-10"
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    转写中…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    转写为侨批风格
                  </>
                )}
              </Button>
            </div>
            <div className="mt-5 flex justify-center">
              <Button
                type="button"
                onClick={handleSend}
                className="vintage-button w-full max-w-xs gap-2 rounded-lg py-3 text-base sm:w-auto sm:min-w-[200px] sm:px-8"
              >
                <Send className="h-5 w-5" />
                寄出
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
