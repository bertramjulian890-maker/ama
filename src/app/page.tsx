'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Sparkles,
  Loader2,
  FileText,
  User,
  Send,
} from 'lucide-react';
import {
  TEMPLATE_LIST,
  type TemplateType,
  LOCATION_OPTIONS,
  getRepublicDate,
} from '@/lib/qiaopi-ui-constants';
import {
  QIAOPI_PRINT_STORAGE_KEY,
  type QiaopiPrintPayload,
} from '@/lib/qiaopi-print-payload';

function validateSendReady(
  transcribedText: string,
  senderName: string,
  receiverTitle: string,
  location: string
): string | null {
  if (!transcribedText.trim()) return '请先点击「转写为侨批风格」完成转写。';
  if (!senderName.trim()) return '请填写寄信人姓名。';
  if (!receiverTitle.trim()) return '请填写收信人称呼。';
  if (!location.trim()) return '请选择寄出地。';
  return null;
}

export default function QiaopiHomePage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType>('home');
  const [inputText, setInputText] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const [senderName, setSenderName] = useState('');
  const [receiverTitle, setReceiverTitle] = useState('');
  const [location, setLocation] = useState('');
  const republicDate = getRepublicDate();

  const handleTranscribe = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsTranscribing(true);
    setTranscribedText('');

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, template: selectedTemplate }),
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
                setTranscribedText(accumulated);
              }
            } catch {
              /* ignore */
            }
          }
        }
      }
    } catch (error) {
      console.error('转写错误:', error);
      setTranscribedText(
        error instanceof Error ? error.message : '转写失败，请稍后重试'
      );
    } finally {
      setIsTranscribing(false);
    }
  }, [inputText, selectedTemplate]);

  const handleSend = useCallback(() => {
    const err = validateSendReady(
      transcribedText,
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
      content: transcribedText.trim(),
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
    transcribedText,
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
          <div className="mb-2 flex items-center justify-center gap-2">
            <FileText className="h-7 w-7 shrink-0 text-amber-800" />
            <h1 className="font-serif text-[clamp(1.5rem,5vw,1.875rem)] tracking-wider text-amber-900">
              侨批情书
            </h1>
          </div>
          <p className="font-serif text-[clamp(0.95rem,2.8vw,1.05rem)] text-amber-800/90">
            竖屏互动 · 一纸侨情
          </p>
          <p className="mx-auto mt-3 text-pretty text-[clamp(0.7rem,2.2vw,0.875rem)] leading-relaxed text-amber-900/75">
            请从上到下填写：先选语气、再写落款与正文并转写；转写结果在下方显示。确认无误后点击
            <strong>「寄出」</strong>
            ，将为您生成可打印的信笺页（本页不预览信纸）。
          </p>
        </div>
      </header>

      <main className="qiaopi-page-main qiaopi-content-width">
        <div className="flex flex-col gap-[clamp(1.25rem,4dvh,2rem)]">
          <section>
            <h2 className="mb-2 flex items-center gap-2 font-serif text-base text-amber-900 sm:text-lg">
              <Sparkles className="h-4 w-4 shrink-0" />
              信件风格（语气）
            </h2>
            <p className="mb-3 text-xs text-amber-800/70">
              仅影响转写语气；收信人称呼在下方自行填写，不会随模板改写。
            </p>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATE_LIST.map((template) => {
                const Icon = template.icon;
                return (
                  <Card
                    key={template.id}
                    className={`template-card cursor-pointer ${
                      selectedTemplate === template.id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardContent className="p-2.5 sm:p-3">
                      <div className="mb-1 flex items-center gap-1">
                        <Icon className="h-4 w-4 shrink-0 text-amber-700" />
                        <span className="font-serif text-sm text-amber-900 sm:text-base">
                          {template.name}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-[10px] text-amber-600/85 sm:text-xs">
                        {template.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-2 flex items-center gap-2 font-serif text-base text-amber-900 sm:text-lg">
              <User className="h-4 w-4 shrink-0" />
              落款与寄出地
            </h2>
            <div className="letter-paper vintage-border space-y-4 rounded-lg p-4">
              <div>
                <Label className="mb-1 block font-serif text-sm text-amber-800">
                  寄信人姓名
                </Label>
                <Input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="请填写署名"
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
                  placeholder="如：母亲大人膝下、阿嬷亲鉴"
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
                  <option value="">请选择南洋城市</option>
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="mb-1 block font-serif text-sm text-amber-800">
                  民国日期（今日）
                </Label>
                <div className="rounded border border-amber-300 bg-amber-100 px-3 py-2 font-serif text-sm text-amber-900">
                  {republicDate.display}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-base text-amber-900 sm:text-lg">
              写下您的心意
            </h2>
            <div className="letter-paper vintage-border rounded-lg p-4">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="用现代话写下想对亲人说的话……"
                className="vintage-input min-h-[120px] resize-none border-0 bg-transparent focus:ring-0 sm:min-h-[140px]"
                disabled={isTranscribing}
              />
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                onClick={handleTranscribe}
                disabled={!inputText.trim() || isTranscribing}
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
          </section>

          <section>
            <h2 className="mb-2 flex items-center gap-2 font-serif text-base text-amber-900 sm:text-lg">
              <FileText className="h-4 w-4 shrink-0" />
              转写结果
            </h2>
            <div className="letter-paper vintage-border min-h-[200px] rounded-lg p-4 sm:min-h-[240px]">
              <div className="font-serif text-sm leading-relaxed whitespace-pre-wrap text-amber-900 sm:text-base">
                {transcribedText ||
                  '（转写内容将在此流式显示；满意后再点击「寄出」生成信笺页。）'}
              </div>
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
            <p className="mt-2 text-center text-[11px] text-amber-800/65">
              寄出后将进入信笺页，可竖屏查看、打印或导出 PNG。
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
