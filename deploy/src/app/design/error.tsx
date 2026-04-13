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

  const handleClearAndReload = () => {
    try {
      localStorage.removeItem('dm_canvas_editor');
    } catch {}
    window.location.reload();
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-[#191F28] gap-4">
      <div className="text-[#F04452] text-lg font-bold">에러 발생</div>
      <div className="text-sm text-[#8B95A1] text-center max-w-sm">
        캔버스 로딩 중 문제가 발생했습니다.
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 text-sm bg-[#3182F6] text-white rounded-lg hover:bg-[#1B64DA] transition-colors"
        >
          다시 시도
        </button>
        <button
          onClick={handleClearAndReload}
          className="px-4 py-2 text-sm bg-white text-[#4E5968] border border-[#E5E8EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
        >
          캔버스 초기화
        </button>
        <button
          onClick={() => { window.location.href = '/'; }}
          className="px-4 py-2 text-sm bg-white text-[#4E5968] border border-[#E5E8EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
        >
          메인으로
        </button>
      </div>
    </div>
  );
}
