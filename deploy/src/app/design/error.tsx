'use client';

import { useEffect, useRef } from 'react';

export default function DesignError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const hasRetried = useRef(false);

  useEffect(() => {
    console.error('Design page error:', error);

    // Auto-reload on first error (handles hydration mismatch from /seed redirect)
    if (!hasRetried.current) {
      hasRetried.current = true;
      window.location.reload();
    }
  }, [error]);

  // Show manual controls only if auto-reload didn't fix it
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-[#e5e2e1] gap-4">
      <div className="w-8 h-8 border-2 border-[#c3c0ff] border-t-transparent rounded-full animate-spin" />
      <div className="text-sm text-[#e5e2e1]/40">페이지를 다시 불러오는 중...</div>
    </div>
  );
}
