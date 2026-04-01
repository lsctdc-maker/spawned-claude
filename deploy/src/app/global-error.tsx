'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body className="bg-white text-[#191F28]">
        <div className="h-screen flex flex-col items-center justify-center gap-4">
          <div className="text-lg font-bold text-[#F04452]">오류가 발생했습니다</div>
          <div className="text-sm text-[#8B95A1] max-w-md text-center">
            페이지를 불러오는 중 문제가 발생했습니다.
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-[#3182F6]/10 text-[#3182F6] rounded-lg text-sm hover:bg-[#3182F6]/20 transition-colors"
            >
              다시 시도
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#F4F5F7] text-[#8B95A1] rounded-lg text-sm hover:bg-[#E5E8EB] transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
