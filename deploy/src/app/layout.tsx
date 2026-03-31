import type { Metadata } from 'next';
import '@/styles/globals.css';
import ClientProviders from '@/components/layout/ClientProviders';

export const metadata: Metadata = {
  title: 'DetailMaker — AI 상세페이지 아틀리에',
  description: '단순한 텍스트 생성이 아닙니다. 제품의 본질을 꿰뚫는 인터뷰와 브랜딩 전략을 통해 프리미엄 상세페이지를 설계합니다.',
  keywords: '상세페이지, AI, DetailMaker, 프리미엄, 이커머스, 상세페이지 제작',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="font-body antialiased bg-[#0a0a0a] text-[#e5e2e1]">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
