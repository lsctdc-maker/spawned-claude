'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[#E5E8EB] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#8B95A1] text-xs">
            &copy; {new Date().getFullYear()} DetailMaker. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/plan" className="text-[#8B95A1] hover:text-[#191F28] text-xs transition-colors">
              서비스 이용약관
            </Link>
            <Link href="/plan" className="text-[#8B95A1] hover:text-[#191F28] text-xs transition-colors">
              개인정보처리방침
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
