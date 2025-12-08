import { useState, useCallback, useEffect, useRef } from 'react';
import { EmotionData, AnalysisConfig, AnalysisResult } from '@/types';
import { analyzeEmotion } from '@/services/api';

/**
 * 감정 분석을 위한 Custom Hook
 * WebSocket 연결, 데이터 처리, 상태 관리 포함
 */
export const useEmotionAnalysis = (config: AnalysisConfig = {}) => {
  const [emotions, setEmotions] = useState<EmotionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAnalysis = useCallback(async (sessionId?: string) => {
    if (!sessionId && !config.sessionId) {
      setError(new Error('Session ID is required'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeEmotion(sessionId || config.sessionId!);
      setAnalysisResult(result);
      setEmotions(result.emotions[result.emotions.length - 1] || null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to analyze emotions');
      setError(error);
      setEmotions(null);
    } finally {
      setLoading(false);
    }
  }, [config.sessionId]);

  // 자동 업데이트 설정
  useEffect(() => {
    if (config.autoUpdate && config.updateInterval) {
      intervalRef.current = setInterval(() => {
        fetchAnalysis();
      }, config.updateInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [config.autoUpdate, config.updateInterval, fetchAnalysis]);

  // 초기 데이터 로드
  useEffect(() => {
    if (config.sessionId) {
      fetchAnalysis();
    }
  }, [config.sessionId, fetchAnalysis]);

  return {
    emotions,
    analysisResult,
    loading,
    error,
    refetch: fetchAnalysis,
  };
};

