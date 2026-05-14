import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '侨批情书 | 南洋侨批风格网页生成器',
    template: '%s | 侨批情书',
  },
  description:
    '以纸传情，以笔寄思 —— 重现南洋侨批的岁月痕迹。基于电影《给阿嬷的情书》风格，将现代文字转写为20世纪初至中期侨批风格的复古书信，生成带有历史质感的侨批图片。',
  keywords: [
    '侨批',
    '南洋侨批',
    '给阿嬷的情书',
    '复古书信',
    '华侨书信',
    '家书',
    '历史风格',
    '复古文案',
  ],
  authors: [{ name: '侨批情书' }],
  generator: 'Next.js',
  openGraph: {
    title: '侨批情书 | 以纸传情，以笔寄思',
    description:
      '重现南洋侨批的岁月痕迹，将现代文字转写为侨批风格的复古书信。',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="en">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
