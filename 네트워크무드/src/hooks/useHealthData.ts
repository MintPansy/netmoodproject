import { useQuery } from '@tanstack/react-query';
import { getHealthData } from '@/services/api';
import { NetworkStats } from '@/types';

/**
 * 네트워크 건강도 데이터를 조회하는 React Query Hook
 */
export const useHealthData = () => {
  return useQuery<NetworkStats>({
    queryKey: ['health'],
    queryFn: getHealthData,
    staleTime: 1000 * 60, // 1분
    refetchInterval: 1000 * 30, // 30초마다 자동 갱신
  });
};

