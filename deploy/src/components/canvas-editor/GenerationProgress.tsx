'use client';

import { RefreshCw, AlertCircle } from 'lucide-react';
import { PipelineStatus, PipelineProgress } from './state/canvasStore';

interface GenerationProgressProps {
  status: PipelineStatus;
  progress: PipelineProgress;
  onRetry?: () => void;
}

function statusMessage(status: PipelineStatus): string {
  switch (status) {
    case 'idle': return '준비 중...';
    case 'loading': return '저장된 디자인 불러오는 중...';
    case 'generating': return 'AI 이미지를 만들고 있어요';
    case 'composing': return '레이아웃을 합성하는 중이에요';
    case 'saving': return '저장하는 중...';
    case 'error': return '오류가 발생했어요';
    default: return '';
  }
}

export default function GenerationProgress({ status, progress, onRetry }: GenerationProgressProps) {
  const { imaged, composed, total, errorMessage } = progress;
  const imagePct = total > 0 ? Math.round((imaged / total) * 100) : 0;
  const composePct = total > 0 ? Math.round((composed / total) * 100) : 0;
  const isError = status === 'error';

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex flex-col items-center">
          {isError ? (
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#3182F6]/10 flex items-center justify-center mb-4">
              <RefreshCw className="w-8 h-8 text-[#3182F6] animate-spin" />
            </div>
          )}

          <h3 className="text-lg font-bold text-[#191F28] mb-2">
            {isError ? '생성에 실패했어요' : '상세페이지를 만들고 있어요'}
          </h3>

          <p className="text-sm text-[#4E5968] mb-6 text-center">
            {statusMessage(status)}
            {!isError && '. 조금만 기다려주세요.'}
          </p>

          {!isError && (
            <div className="w-full space-y-4">
              {/* 이미지 생성 진행률 */}
              <div>
                <div className="flex justify-between text-xs text-[#4E5968] mb-1.5">
                  <span>이미지 생성</span>
                  <span className="font-medium">{imaged} / {total}</span>
                </div>
                <div className="h-2 bg-[#F2F4F6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3182F6] transition-all duration-300"
                    style={{ width: `${imagePct}%` }}
                  />
                </div>
              </div>

              {/* 레이아웃 합성 진행률 */}
              <div>
                <div className="flex justify-between text-xs text-[#4E5968] mb-1.5">
                  <span>레이아웃 합성</span>
                  <span className="font-medium">{composed} / {total}</span>
                </div>
                <div className="h-2 bg-[#F2F4F6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4CAF50] transition-all duration-300"
                    style={{ width: `${composePct}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-[#8B95A1] text-center pt-2">
                예상 소요: 약 30-60초 · 다음 접속부터는 즉시 로드됩니다
              </p>
            </div>
          )}

          {isError && (
            <>
              {errorMessage && (
                <p className="text-xs text-[#4E5968] mb-4 text-center px-4 py-2 bg-red-50 rounded-lg break-all">
                  {errorMessage}
                </p>
              )}
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="w-full py-3 px-4 bg-[#3182F6] text-white rounded-lg font-medium hover:bg-[#1E67D9] transition-colors"
                >
                  다시 시도
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
