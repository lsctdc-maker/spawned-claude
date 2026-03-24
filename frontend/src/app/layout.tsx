import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: '디테일메이커 — AI 상세페이지 자동 생성',
  description: 'AI가 만들어주는 한국형 상세페이지. 상품 정보만 입력하면 전문가 수준의 상세페이지가 자동으로 완성됩니다.',
  keywords: '상세페이지, AI, 자동생성, 쇼핑몰, 상세페이지 제작, 한국형',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
