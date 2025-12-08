import { useQuery } from '@tanstack/react-query';
import { getAnalysisHistory } from '@/services/api';
import { AnalysisResult } from '@/types';

/**
 * 분석 히스토리를 조회하는 React Query Hook
 */
export const useAnalysisHistory = (sessionId: string) => {
  return useQuery<AnalysisResult[]>({
    queryKey: ['analysis', 'history', sessionId],
    queryFn: () => getAnalysisHistory(sessionId),
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5, // 5분
  });
};

