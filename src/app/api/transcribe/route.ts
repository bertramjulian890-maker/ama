import { NextRequest, NextResponse } from 'next/server';
import {
  chatCompletionsUrl,
  getChatApiKey,
  getTranscribeModel,
} from '@/lib/llm-env';
import { iterateChatCompletionTextDeltas } from '@/lib/openai-chat-sse';
import {
  TEMPLATE_PROMPTS,
  buildMovieStyleReference,
  buildOutputLengthInstruction,
  buildOutputPunctuationInstruction,
  buildUserTranscribeTask,
  getMaxInputChars,
} from '@/lib/qiaopi-transcribe-prompts';
import {
  LOCATION_OPTIONS,
  MOVIE_DEFAULT_LOCATION,
} from '@/lib/qiaopi-ui-constants';

export async function POST(request: NextRequest) {
  try {
    const { text, template = 'home', location, senderName, receiverTitle } =
      await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: '请输入要转写的文字' },
        { status: 400 }
      );
    }

    const maxIn = getMaxInputChars();
    if (text.length > maxIn) {
      return NextResponse.json(
        { error: `正文过长（当前 ${text.length} 字），请控制在 ${maxIn} 字以内。` },
        { status: 400 }
      );
    }

    const apiKey = getChatApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            '未配置 API 密钥。在 .env.local 中设置 DEEPSEEK_API_KEY 或 OPENAI_API_KEY；DeepSeek 需同时设置 OPENAI_BASE_URL=https://api.deepseek.com',
        },
        { status: 503 }
      );
    }

    const senderLocation =
      typeof location === 'string' &&
      (LOCATION_OPTIONS as readonly string[]).includes(location)
        ? location
        : MOVIE_DEFAULT_LOCATION;

    const systemBase =
      TEMPLATE_PROMPTS[template] || TEMPLATE_PROMPTS['home'];
    const systemPrompt = `${buildMovieStyleReference()}\n\n${systemBase}\n\n${buildOutputLengthInstruction()}\n\n${buildOutputPunctuationInstruction()}`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      {
        role: 'user' as const,
        content: buildUserTranscribeTask(text, senderLocation, {
          senderName: typeof senderName === 'string' ? senderName : undefined,
          receiverTitle:
            typeof receiverTitle === 'string' ? receiverTitle : undefined,
        }),
      },
    ];

    const upstream = await fetch(chatCompletionsUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: getTranscribeModel(),
        messages,
        stream: true,
        temperature: 0.8,
      }),
    });

    if (!upstream.ok) {
      const errBody = await upstream.text();
      console.error('transcribe upstream', upstream.status, errBody);
      return NextResponse.json(
        {
          error: `上游接口错误 (${upstream.status})，请检查 BASE_URL、模型名与密钥。`,
        },
        { status: 502 }
      );
    }

    if (!upstream.body) {
      return NextResponse.json({ error: '上游无响应体' }, { status: 502 });
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of iterateChatCompletionTextDeltas(
            upstream.body
          )) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ content: chunk })}\n\n`
              )
            );
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('文本转写错误:', error);
    return NextResponse.json(
      { error: '文本转写失败，请稍后重试' },
      { status: 500 }
    );
  }
}
