'use client';

import { useState, useCallback } from 'react';
import { APIResponse } from '@/lib/types';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(options: UseApiOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (apiCall: () => Promise<APIResponse<T>>) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall();
        if (result.success && result.data) {
          setData(result.data);
          options.onSuccess?.(result.data);
        } else {
          const errMsg = result.error || '요청에 실패했습니다.';
          setError(errMsg);
          options.onError?.(errMsg);
        }
        return result;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
        setError(errMsg);
        options.onError?.(errMsg);
        return { success: false, error: errMsg } as APIResponse<T>;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return { loading, error, data, execute };
}
