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
                <a href="#" className="text-[#e5e2e1]/50 hover:text-[#c3c0ff] text-xs transition-all">
                  주요 기능
                </a>
              </li>
              <li>
                <a href="#" className="text-[#e5e2e1]/50 hover:text-[#c3c0ff] text-xs transition-all">
                  AI 스튜디오
                </a>
              </li>
              <li>
                <a href="#" className="text-[#e5e2e1]/50 hover:text-[#c3c0ff] text-xs transition-all">
                  요금제
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: 리소스 */}
          <div>
            <h3 className="font-headline font-bold text-[#e5e2e1] text-sm mb-4">
              리소스
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-[#e5e2e1]/50 hover:text-[#c3c0ff] text-xs transition-all">
                  문서
                </a>
              </li>
              <li>
                <a href="#" className="text-[#e5e2e1]/50 hover:text-[#c3c0ff] text-xs transition-all">
                  가이드
                </a>
              </li>
              <li>
                <a href="#" className="text-[#e5e2e1]/50 hover:text-[#c3c0ff] text-xs transition-all">
                  사이트맵
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: 법적 고지 */}
          <div>
            <h3 className="font-headline font-bold text-[#e5e2e1] text-sm mb-4">
              법적 고지
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-[#e5e2e1]/50 hover:text-[#c3c0ff] text-xs transition-all">
                  개인정보 처리방침
                </a>
              </li>
              <li>
                <a href="#" className="text-[#e5e2e1]/50 hover:text-[#c3c0ff] text-xs transition-all">
                  이용약관
                </a>
              </li>
              <li>
                <a href="#" className="text-[#e5e2e1]/50 hover:text-[#c3c0ff] text-xs transition-all">
                  쿠키 정책
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
