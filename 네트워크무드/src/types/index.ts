/**
 * NetMood Analyzer - TypeScript Type Definitions
 */

// 감정 타입
export type EmotionType = 'calm' | 'joy' | 'anxiety' | 'anger' | 'sadness';

// 감정 데이터 구조
export interface EmotionData {
  calm: number;
  joy: number;
  anxiety: number;
  anger: number;
  sadness: number;
  timestamp: string;
}

// 네트워크 건강도 점수
export interface HealthScore {
  score: number; // 1-10
  status: 'excellent' | 'good' | 'warning' | 'critical';
  message: string;
}

// 분석 설정
export interface AnalysisConfig {
  sessionId?: string;
  autoUpdate?: boolean;
  updateInterval?: number; // milliseconds
}

// 실시간 데이터
export interface RealtimeData {
  id: string;
  emotion: EmotionData;
  healthScore: HealthScore;
  timestamp: string;
}

// 네트워크 통계
export interface NetworkStats {
  totalDataPoints: number;
  activeConnections: number;
  threatLevel: 'low' | 'medium' | 'high';
}

// 분석 결과
export interface AnalysisResult {
  sessionId: string;
  emotions: EmotionData[];
  healthScore: HealthScore;
  networkStats: NetworkStats;
  createdAt: string;
  updatedAt: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// 파일 업로드
export interface FileUploadResponse {
  uploadId: string;
  filename: string;
  status: 'processing' | 'completed' | 'failed';
}

// WebSocket 이벤트 타입
export type SocketEvent = 
  | 'emotion:update'
  | 'analysis:done'
  | 'health:update'
  | 'error';

export interface SocketEventPayload {
  type: SocketEvent;
  data: RealtimeData | AnalysisResult | Error;
}

// 차트 데이터 포인트
export interface ChartDataPoint {
  timestamp: string;
  emotions: EmotionData;
}

// 시간 범위 옵션
export type TimeRange = '3h' | '1d' | '1w' | '1m' | '3m';

