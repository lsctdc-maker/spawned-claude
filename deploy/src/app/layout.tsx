import type { Metadata } from 'next';
import '@/styles/globals.css';
import ClientProviders from '@/components/layout/ClientProviders';

export const metadata: Metadata = {
  title: 'DetailMaker — AI 상세페이지 자동 생성',
  description: '복잡한 과정 없이, 누구나 쉽게 고퀄리티 상세페이지를 완성합니다. 지금 바로 무료로 체험해보세요.',
  keywords: '상세페이지, AI, DetailMaker, 이커머스, 상세페이지 제작',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="font-body antialiased bg-white text-[#191F28]" suppressHydrationWarning>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
