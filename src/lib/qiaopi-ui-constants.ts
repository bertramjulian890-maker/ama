import { Home, Heart, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type TemplateType = 'home' | 'peace' | 'miss';

export type TemplateMeta = {
  id: TemplateType;
  name: string;
  description: string;
  icon: LucideIcon;
  example: string;
};

export const TEMPLATE_LIST: TemplateMeta[] = [
  {
    id: 'home',
    name: '家书',
    description: '温情脉脉，寄语家乡亲人',
    icon: Home,
    example: '阿嬷亲鉴：违别多时，念念不忘……',
  },
  {
    id: 'peace',
    name: '报平安',
    description: '简洁恳切，让家人安心放心',
    icon: Shield,
    example: '母亲大人膝下：儿已平安到达南洋……',
  },
  {
    id: 'miss',
    name: '思念',
    description: '深情款款，诉尽离愁别绪',
    icon: Heart,
    example: '吾爱亲启：魂牵梦绕，日夜思念……',
  },
];

export const LOCATION_OPTIONS = [
  '万象城',
  '万象汇',
] as const;

export const MOVIE_DEFAULT_SENDER = '木生';
export const MOVIE_DEFAULT_RECEIVER = '淑柔';
export const MOVIE_DEFAULT_LOCATION = LOCATION_OPTIONS[0];
export const MOVIE_CINEMA_BRAND = '万象影城';

export function getRepublicDate(): {
  year: number;
  month: number;
  day: number;
  display: string;
} {
  const republicYear = 48;
  const month = 8;
  const day = 15;

  const chineseNums = [
    '零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
  ];
  const toChinese = (n: number): string => {
    if (n <= 10) return chineseNums[n];
    if (n < 20) return '十' + (n % 10 === 0 ? '' : chineseNums[n % 10]);
    if (n < 100) {
      const tens = Math.floor(n / 10);
      const ones = n % 10;
      return chineseNums[tens] + '十' + (ones === 0 ? '' : chineseNums[ones]);
    }
    return n.toString();
  };

  const display = `民國${toChinese(republicYear)}年${toChinese(month)}月${toChinese(day)}日`;
  return { year: republicYear, month, day, display };
}
