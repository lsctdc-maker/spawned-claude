'use client';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm">
              D
            </div>
            <span className="text-sm font-semibold text-gray-700">
              디테일메이커
            </span>
          </div>
          <p className="text-sm text-gray-400">
            AI 기반 한국형 상세페이지 자동 생성 서비스
          </p>
          <p className="text-xs text-gray-400">
            &copy; 2024 DetailMaker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
