/** 对话 API：OpenAI 兼容（DeepSeek、OpenAI 等） */

export function getChatApiKey(): string {
  return (
    process.env.DEEPSEEK_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    ''
  );
}

/** 不含尾部斜杠；DeepSeek 为 https://api.deepseek.com，OpenAI 官方常为 https://api.openai.com/v1 */
export function getChatBaseUrl(): string {
  const raw =
    process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1';
  return raw.replace(/\/$/, '');
}

export function chatCompletionsUrl(): string {
  const base = getChatBaseUrl();
  if (base.endsWith('/chat/completions')) return base;
  return `${base}/chat/completions`;
}

export function getTranscribeModel(): string {
  return (
    process.env.QIAOPI_LLM_MODEL?.trim() || 'deepseek-v4-flash'
  );
}
