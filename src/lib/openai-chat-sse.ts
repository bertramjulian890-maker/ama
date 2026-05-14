/**
 * 解析 OpenAI 兼容的 chat completions SSE（data: {...}），产出 delta 文本片段。
 */
export async function* iterateChatCompletionTextDeltas(
  body: ReadableStream<Uint8Array> | null
): AsyncGenerator<string, void, undefined> {
  if (!body) return;
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue;
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') return;
      try {
        const json = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string | null } }>;
        };
        const piece = json.choices?.[0]?.delta?.content;
        if (typeof piece === 'string' && piece.length > 0) yield piece;
      } catch {
        /* 忽略非 JSON 行 */
      }
    }
  }
}
