'use client';

import { useEffect } from 'react';

export default function DesignError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Design page error:', error);
  }, [error]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-[#e5e2e1] gap-4">
      <div className="text-lg font-bold text-red-400">페이지 로딩 오류</div>
      <div className="text-sm text-[#e5e2e1]/60 max-w-md text-center">
        페이지를 불러오는 중 오류가 발생했습니다.
      </div>
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-[#c3c0ff]/20 text-[#c3c0ff] rounded-lg text-sm hover:bg-[#c3c0ff]/30 transition-colors"
        >
          다시 시도
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#e5e2e1]/10 text-[#e5e2e1]/60 rounded-lg text-sm hover:bg-[#e5e2e1]/20 transition-colors"
        >
          새로고침
        </button>
      </div>
    </div>
  );
}
