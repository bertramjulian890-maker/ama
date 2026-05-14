import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '侨批信笺',
  robots: { index: false, follow: false },
};

export default function LetterLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* 提前预加载字体，避免字体切换导致的布局跳动 */}
      <link
        rel="preload"
        href="/fonts/MasaFont-Regular.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      {children}
    </>
  );
}
