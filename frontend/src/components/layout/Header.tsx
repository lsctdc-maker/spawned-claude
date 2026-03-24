'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
              D
            </div>
            <span className="text-lg font-bold text-gray-900">
              디테일<span className="text-primary-600">메이커</span>
            </span>
          </Link>

          {/* 네비게이션 */}
          <nav className="flex items-center gap-4">
            <Link
              href="/create"
              className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
            >
              무료로 시작하기
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
