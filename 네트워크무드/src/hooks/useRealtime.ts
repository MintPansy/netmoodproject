import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeData, EmotionData, HealthScore } from '@/types';
import { useSocket } from './useSocket';

/**
 * 실시간 데이터를 관리하는 Custom Hook
 * WebSocket을 통해 실시간 업데이트 수신
 */
export const useRealtime = (sessionId?: string) => {
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
  const [emotions, setEmotions] = useState<EmotionData | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socket = useSocket();
  const dataBufferRef = useRef<RealtimeData[]>([]);

  // WebSocket 이벤트 리스너 설정
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      if (sessionId) {
        socket.emit('subscribe', { sessionId });
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleEmotionUpdate = (payload: RealtimeData) => {
      setRealtimeData(payload);
      setEmotions(payload.emotion);
      setHealthScore(payload.healthScore);

      // 데이터 버퍼에 추가 (차트용)
      dataBufferRef.current.push(payload);
      if (dataBufferRef.current.length > 100) {
        dataBufferRef.current.shift(); // 최대 100개만 유지
      }
    };

    const handleAnalysisDone = (payload: RealtimeData) => {
      handleEmotionUpdate(payload);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('emotion:update', handleEmotionUpdate);
    socket.on('analysis:done', handleAnalysisDone);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('emotion:update', handleEmotionUpdate);
      socket.off('analysis:done', handleAnalysisDone);
    };
  }, [socket, sessionId]);

  const getDataHistory = useCallback(() => {
    return dataBufferRef.current;
  }, []);

  const clearHistory = useCallback(() => {
    dataBufferRef.current = [];
  }, []);

  return {
    realtimeData,
    emotions,
    healthScore,
    isConnected,
    getDataHistory,
    clearHistory,
  };
};

