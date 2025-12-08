import axios, { AxiosInstance, AxiosError } from 'axios';
import { AnalysisResult, FileUploadResponse, ApiResponse, NetworkStats } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Axios 인스턴스 생성
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 필요시 인증 토큰 추가
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 에러 처리 로직
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * 감정 분석 API
 */
export const analyzeEmotion = async (sessionId: string): Promise<AnalysisResult> => {
  const response = await apiClient.get<ApiResponse<AnalysisResult>>(`/analyze/${sessionId}`);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Analysis failed');
  }
  return response.data.data;
};

/**
 * 파일 업로드 API
 */
export const uploadFile = async (file: File, onProgress?: (progress: number) => void): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<FileUploadResponse>>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.error || 'Upload failed');
  }
  return response.data.data;
};

/**
 * 분석 히스토리 조회
 */
export const getAnalysisHistory = async (sessionId: string): Promise<AnalysisResult[]> => {
  const response = await apiClient.get<ApiResponse<AnalysisResult[]>>(`/history/${sessionId}`);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to fetch history');
  }
  return response.data.data;
};

/**
 * 네트워크 건강도 조회
 */
export const getHealthData = async (): Promise<NetworkStats> => {
  const response = await apiClient.get<ApiResponse<NetworkStats>>('/health');
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to fetch health data');
  }
  return response.data.data;
};

/**
 * 모니터링 시작
 */
export const startMonitoring = async (): Promise<{ sessionId: string }> => {
  const response = await apiClient.post<ApiResponse<{ sessionId: string }>>('/monitoring/start');
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to start monitoring');
  }
  return response.data.data;
};

/**
 * 모니터링 중지
 */
export const stopMonitoring = async (sessionId: string): Promise<void> => {
  const response = await apiClient.post<ApiResponse<void>>(`/monitoring/stop/${sessionId}`);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to stop monitoring');
  }
};

