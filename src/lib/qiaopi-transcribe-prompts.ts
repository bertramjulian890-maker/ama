/**
 * 侨批「转写」相关提示词与字数上限 —— 改文案请主要编辑本文件。
 *
 * - 各模板系统提示：`TEMPLATE_PROMPTS`（home / peace / miss）
 * - 用户侧任务句式（把现代文交给模型转写）：在 `src/app/api/transcribe/route.ts`
 *   中调用 `buildUserTranscribeTask()`，拼接寄出地与用户原文
 * - 输入长度上限：`getMaxInputChars()`（环境变量 `QIAOPI_MAX_INPUT_CHARS`）
 * - 输出长度约束：在 route 里给 system 追加 `buildOutputLengthInstruction()`
 */

/** 用户原文最大字符数（超出返回 400，默认 1500） */
export const DEFAULT_MAX_INPUT_CHARS = 1500;

export function getMaxInputChars(): number {
  const raw = process.env.QIAOPI_MAX_INPUT_CHARS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : DEFAULT_MAX_INPUT_CHARS;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_INPUT_CHARS;
}

/**
 * 期望模型输出上限（写入 system，默认 160 字）。
 * 信笺正文区为 7 列；超过约 160 字后字号会明显缩小，且易超出纸面。
 */
export const DEFAULT_MAX_OUTPUT_CHARS = 160;

export function getMaxOutputChars(): number {
  const raw = process.env.QIAOPI_MAX_OUTPUT_CHARS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : DEFAULT_MAX_OUTPUT_CHARS;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_OUTPUT_CHARS;
}

export function buildOutputLengthInstruction(): string {
  const max = getMaxOutputChars();
  return `【篇幅】转写正文不得超过 ${max} 个繁体汉字（含标点可略宽）。宜短不宜长，若原文很长须浓缩为侨批书信体，宁短勿长，勿堆砌冗长。`;
}

export function buildOutputPunctuationInstruction(): string {
  return `【标点】正文仅可使用全角逗号「，」、句号「。」、感叹号「！」、问号「？」；勿使用破折号、省略号、顿号、冒号、分号、引号、括号、书名号、斜杠及其他特殊符号。`;
}

/**
 * 电影《给阿嬷的情书》风格参考块 —— 作为 system prompt 的前置风格指引。
 * 影片豆瓣 9.1 分，以潮汕侨批文化为背景，讲述跨越半个世纪的守望故事。
 * 本项目的转写风格应与其保持一致：**极致的克制、朴素叙事中的深情、纸短情长**。
 */
export function buildMovieStyleReference(): string {
  return `【风格来源】
本项目灵感源自电影《给阿嬷的情书》（2026，豆瓣9.1）。以下为该片的风格指引，请严格遵循：

【情感调性】
- 保持"极致的克制"——不煽情、不卖惨、不狗血，情感在平凡日常中静静流淌
- 没有撕心裂肺的哭号，没有慷慨激昂的口号——最动人的是朴素的细节
- 深情藏在平淡的话里，而非堆砌感情词

【侨批语调参考】
以下为电影中出现的侨批原文范例，请以此为准绳把握语感；范例中的称呼、问候、落款仅供语感参考，不得写入你输出的正文：

> 近日常于灯下提笔，一切无恙。夜深风起，似是故乡旧时月色，便愈念家中安好。

> 今夜独坐灯下，每每想起家里孩子，勿念。此生亏欠你太多，若有来生，必不再与你分离。

> 一百元已收到，家中一切安好，勿念。七夕当夜，梦你衣锦归来，仍是少年模样。梦醒行至寨门前，闻溪水潺潺，方觉夜深，念你安康，好梦即已知足。

> 谁言女子之肩不够伟岸，为母则刚，恰似你的样子。往后切莫孤勇，平安为要。

【关键用词】
- 可写牵挂、惦念、故里、归程、灯火、街市、巷口等家常身段
- 可少量使用批银、寄奉等侨批旧语，但勿写成离国过番、侨居海外
- 核心语感：心有所寄，身若比邻，以此把握距离中的深情

【特别注意】
- 转写的不是翻译，是还原民国侨批的古朴与深情
- 一律使用繁体中文输出，包含标点前后的正文，不要输出简体字
- 寄信处所固定为万象影城所在的国内商业综合体「万象城」或「万象汇」；二者是商场商街名称，不是城市、县城或异乡地名，正文须自然写出用户所选名称
- 勿写暹罗、南洋、过番、番批、行船出海等海外漂泊场景
- 时代感以 1940 年代至 1960 年以前为主，避免出现不必要的当代词汇、互联网表达
- 勿硬套「候影」「观影」「放映」「迴廊」等固定词；仅当用户原文已写到看电影、等人、等人散场等活动时，才可顺势带出
- 信笺页面会另行排版称呼、落款与署名；你只输出正文段落，不要输出称呼、冒号、署名、日期或解释说明
- 正文开头不得出现收信人姓名、称呼或问候套话，如「吾妻淑柔」「吾夫木生」「XX亲鉴」「见信如晤」「展信安康」「见信安康」等
- 勿默认套用电影角色木生、淑柔或固定夫妻身份；人物关系以用户提供的寄信人、收信人信息为准
- 用户所选寄出地（万象城或万象汇）须在正文中自然写出，可融入商场商街光景；勿写成落款地名，勿把商业综合体误写成城市或异乡
- 保持原文的核心情感和内容，只是改变表达方式，不要编造新的情节
- 即使原文很平淡，转写后也要有民国书信的典雅和温度，但不要过度修饰`; }

export const USER_TASK_PREFIX =
  '请将以下现代文字转写为电影《给阿嬷的情书》气质的繁体侨批正文。只输出繁体正文，不要输出称呼、落款、署名、日期或解释说明：\n\n';

export function buildSenderLocationContext(location: string): string {
  return `【寄信处所】寄信人此刻身在万象影城所在的国内商业综合体「${location}」。「万象城」「万象汇」是商场商街名称，不是城市、县城或异乡地名。转写时须在正文中自然写出「${location}」；场所描写贴合用户原文，勿硬写候影、观影、放映、迴廊等字样，勿写成促销文案，勿把商业综合体写成城市或客居他乡，勿改写成暹罗、南洋、过番等海外漂泊场景。`;
}

export function buildLetterParticipantsContext(
  senderName?: string,
  receiverTitle?: string
): string {
  const sender = senderName?.trim();
  const receiver = receiverTitle?.trim();
  if (!sender && !receiver) {
    return '【人物】称呼与落款由信笺页面另行排版；你只写正文，勿在正文写出收信人称呼、问候套话或寄信人署名。';
  }
  const parts = ['【人物】'];
  if (sender) parts.push(`寄信人：${sender}。`);
  if (receiver) parts.push(`收信人：${receiver}。`);
  parts.push(
    '称呼与落款由信笺页面另行排版；你只写正文，勿在正文写出收信人姓名、称呼、问候套话或寄信人署名。'
  );
  return parts.join('');
}

export function buildUserTranscribeTask(
  text: string,
  location: string,
  participants?: { senderName?: string; receiverTitle?: string }
): string {
  return `${USER_TASK_PREFIX}${buildLetterParticipantsContext(
    participants?.senderName,
    participants?.receiverTitle
  )}\n\n${buildSenderLocationContext(location)}\n\n【用户原文】\n${text}`;
}

export const TEMPLATE_PROMPTS: Record<string, string> = {
  movie: `你是一位为电影《给阿嬷的情书》影院互动装置书写侨批正文的作者。
请把用户的现代文字转写为侨批家书正文，要求：
1. 语气克制、朴素、深情，像电影里的旧侨批，不要煽情喊口号
2. 场景以用户所选「万象城」或「万象汇」国内商业综合体为主，场所描写贴合用户原文；勿把商业综合体写成城市或异乡，勿写暹罗、南洋、过番等海外漂泊语汇，勿硬套候影、观影、放映等字样
3. 保留用户原意，少量补足时代氛围，不凭空新增重大情节
4. 只写正文段落，不写称呼、问候套话、署名、日期或任何说明
5. 一律使用繁体中文，不要出现简体字
6. 须在正文中自然写出用户所选寄出地「万象城」或「万象汇」，但不要夸大直植广告句，勿把商业综合体误写成城市
7. 标点仅使用「，」「。」「！」「？」，勿使用破折号、省略号及其他特殊符号`,

  home: `你是一位精通20世纪初至中期侨批（华侨寄给家乡亲人的信件兼汇款凭证）风格文案的创作者。
请将用户的现代文字转写为侨批风格的家书，要求：
1. 使用典雅的半文半白语言，带有闽粤方言韵味
2. 称呼要亲切传统，如"阿嬷亲鉴"、"母亲大人膝下"等
3. 开头常用"违别多时，念念不忘"、"去国怀乡，羁旅天涯"等套话
4. 结尾常用"叩请金安"、"伏惟珍重"等传统问候
5. 文字要真挚感人，带有时代沧桑感
6. 适度加入"批银"、"寄奉"等侨批特有用语
7. 保持原文的核心情感和内容，只是改变表达方式`,

  peace: `你是一位精通20世纪初至中期侨批风格的创作者。
请将用户的现代文字转写为报平安的侨批信件，要求：
1. 语言简洁恳切，以报平安为主要目的
2. 常用"平安到达"、"安好无恙"等套话
3. 表达对家乡亲人的牵挂与思念
4. 语气要稳重可靠，让收信人安心
5. 结尾常用"勿念"、"请勿挂念"等安抚语句
6. 保持侨批特有的书信格式和用语习惯`,

  miss: `你是一位精通20世纪初至中期侨批风格的创作者。
请将用户的现代文字转写为表达思念的侨批信件，要求：
1. 文字深情款款，真挚动人
2. 常用"魂牵梦绕"、"日夜思念"等表达
3. 可以用"明月千里寄相思"等诗意表达
4. 语言要缠绵悱恻，带有离愁别绪
5. 体现海外游子对故土亲人的深切眷恋
6. 结尾要情真意切，催人泪下`,
};
