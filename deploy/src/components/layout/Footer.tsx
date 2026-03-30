'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#131313] border-t border-[#e5e2e1]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Brand */}
          <div>
            <h3 className="font-headline font-bold text-[#e5e2e1] text-sm mb-4">
              DetailMaker
            </h3>
            <p className="text-[#e5e2e1]/30 text-xs">
              © 2024 DetailMaker. 전문가를 위한 AI 상세페이지 아틀리에.
            </p>
          </div>

          {/* Column 2: 제품 */}
          <div>
            <h3 className="font-headline font-bold text-[#e5e2e1] text-sm mb-4">
              제품
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/plan" className="text-[#e5e2e1]/50 hover:text-[#c3c0ff] text-xs transition-all">
                  AI 기획
                </Link>
              </li>
              <li>
                <Link href="/design" className="text-[#e5e2e1]/50 hover:text-[#c3c0ff] text-xs transition-all">
                  이미지 제작
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: 법적 고지 */}
          <div>
            <h3 className="font-headline font-bold text-[#e5e2e1] text-sm mb-4">
              법적 고지
            </h3>
            <ul className="space-y-3">
              <li>
                <span className="text-[#e5e2e1]/30 text-xs cursor-default">
                  개인정보 처리방침
                </span>
              </li>
              <li>
                <span className="text-[#e5e2e1]/30 text-xs cursor-default">
                  이용약관
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
