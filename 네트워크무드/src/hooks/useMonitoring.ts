import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startMonitoring, stopMonitoring } from '@/services/api';

/**
 * 모니터링 시작/중지를 위한 React Query Hooks
 */
export const useStartMonitoring = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startMonitoring,
    onSuccess: (data) => {
      // 모니터링 시작 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['analysis'] });
      queryClient.setQueryData(['monitoring', 'session'], data.sessionId);
    },
  });
};

export const useStopMonitoring = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stopMonitoring,
    onSuccess: () => {
      // 모니터링 중지 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['analysis'] });
      queryClient.removeQueries({ queryKey: ['monitoring', 'session'] });
    },
  });
};

