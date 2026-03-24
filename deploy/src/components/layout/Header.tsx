'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#131313]/60 backdrop-blur-xl border-b border-[#e5e2e1]/15 shadow-[0_10px_40px_rgba(229,226,225,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-black tracking-tighter text-[#e5e2e1] font-headline">
              DetailMaker
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-[#e5e2e1]/70 hover:text-[#e5e2e1] transition-colors font-headline font-bold tracking-tight text-sm">
              주요 기능
            </a>
            <a href="#" className="text-[#e5e2e1]/70 hover:text-[#e5e2e1] transition-colors font-headline font-bold tracking-tight text-sm">
              AI 스튜디오
            </a>
            <a href="#" className="text-[#e5e2e1]/70 hover:text-[#e5e2e1] transition-colors font-headline font-bold tracking-tight text-sm">
              요금제
            </a>
            <a href="#" className="text-[#e5e2e1]/70 hover:text-[#e5e2e1] transition-colors font-headline font-bold tracking-tight text-sm">
              로그인
            </a>
          </nav>
          <Link
            href="/create"
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#c3c0ff] to-[#e5e2e1] text-[#0f0069] font-headline font-bold text-sm hover:scale-105 active:scale-95 transition-all duration-300"
          >
            시작하기
          </Link>
        </div>
      </div>
    </header>
  );
}
