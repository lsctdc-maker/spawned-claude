import type { Metadata } from 'next';
import '@/styles/globals.css';

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-[#131313] text-[#e5e2e1]">
        {children}
      </body>
    </html>
  );
}
