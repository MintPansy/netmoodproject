import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { EmotionCard } from '@/components/EmotionCard';
import { HealthScoreCard } from '@/components/HealthScoreCard';
import { EmotionChart } from '@/components/EmotionChart';
import { FileUpload } from '@/components/FileUpload';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/Tabs';
import { Alert } from '@/components/Alert';
import { useEmotionAnalysis } from '@/hooks/useEmotionAnalysis';
import { useRealtime } from '@/hooks/useRealtime';
import { EmotionData, HealthScore, NetworkStats, TimeRange, ChartDataPoint, FileUploadResponse } from '@/types';
import { calculateHealthScore, normalizeEmotions } from '@/utils/emotionUtils';
import * as styles from '@/pages/dashboard.css';

const MOCK_NETWORK_STATS: NetworkStats = {
  totalDataPoints: 318,
  activeConnections: 24,
  threatLevel: 'medium',
};

export default function Dashboard() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('1d');
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const { emotions: analysisEmotions, loading } = useEmotionAnalysis({
    sessionId,
    autoUpdate: true,
    updateInterval: 5000,
  });

  const { emotions: realtimeEmotions, healthScore: realtimeHealthScore, getDataHistory } = useRealtime(sessionId);

  // 실시간 데이터 우선 사용
  const currentEmotions = realtimeEmotions || analysisEmotions || getMockEmotions();
  const normalizedEmotions = normalizeEmotions(currentEmotions);
  const healthScore = realtimeHealthScore || calculateHealthScore(currentEmotions);

  // 차트 데이터 생성
  const chartData: ChartDataPoint[] = useMemo(() => {
    const history = getDataHistory();
    if (history.length > 0) {
      return history.map((data) => ({
        timestamp: data.timestamp,
        emotions: data.emotion,
      }));
    }
    // Mock 데이터
    return generateMockChartData();
  }, [getDataHistory]);

  const handleUploadSuccess = (response: FileUploadResponse) => {
    setSessionId(response.uploadId);
    setAlert({
      isOpen: true,
      title: '업로드 성공',
      message: `파일이 성공적으로 업로드되었습니다. 분석을 시작합니다.`,
      severity: 'success',
    });
  };

  const handleUploadError = (error: Error) => {
    setAlert({
      isOpen: true,
      title: '업로드 실패',
      message: error.message || '파일 업로드 중 오류가 발생했습니다.',
      severity: 'error',
    });
  };

  // 위험 감정 감지
  const threatEmotions = useMemo(() => {
    const threats: Array<{ emotion: keyof EmotionData; value: number }> = [];
    if (normalizedEmotions.anger > 0.15) {
      threats.push({ emotion: 'anger', value: normalizedEmotions.anger });
    }
    if (normalizedEmotions.anxiety > 0.25) {
      threats.push({ emotion: 'anxiety', value: normalizedEmotions.anxiety });
    }
    return threats;
  }, [normalizedEmotions]);

  return (
    <>
      <Head>
        <title>NetMood Analyzer - 대시보드</title>
        <meta name="description" content="네트워크 트래픽 감정 분석 대시보드" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>NetMood Analyzer</h1>
          <p className={styles.subtitle}>네트워크 트래픽 감정 분석 대시보드</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="analysis">분석</TabsTrigger>
            <TabsTrigger value="upload">파일 업로드</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className={styles.content}>
              <HealthScoreCard healthScore={healthScore} networkStats={MOCK_NETWORK_STATS} />

              {threatEmotions.length > 0 && (
                <div className={styles.threatSection}>
                  <h3 className={styles.threatTitle}>⚠️ 위험 감정 감지</h3>
                  {threatEmotions.map((threat) => (
                    <div key={threat.emotion} className={styles.threatItem}>
                      <span>{threat.emotion === 'anger' ? '😡' : '😰'}</span>
                      <span>
                        {threat.emotion === 'anger' ? '화남' : '불안'}:{' '}
                        {(threat.value * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <section className={styles.emotionsSection}>
                <h2 className={styles.sectionTitle}>감정별 분석</h2>
                <div className={styles.emotionGrid}>
                  <EmotionCard emotion="calm" value={normalizedEmotions.calm} />
                  <EmotionCard emotion="joy" value={normalizedEmotions.joy} />
                  <EmotionCard emotion="anxiety" value={normalizedEmotions.anxiety} />
                  <EmotionCard emotion="anger" value={normalizedEmotions.anger} />
                  <EmotionCard emotion="sadness" value={normalizedEmotions.sadness} />
                </div>
              </section>

              {loading && (
                <div className={styles.loading}>
                  <p>분석 중...</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            <div className={styles.content}>
              <EmotionChart
                data={chartData}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                height={400}
              />
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <div className={styles.content}>
              <FileUpload
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                accept=".csv"
                maxSize={10 * 1024 * 1024}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Alert
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        severity={alert.severity}
        onConfirm={() => setAlert({ ...alert, isOpen: false })}
      />
    </>
  );
}

// Helper functions
function getMockEmotions(): EmotionData {
  return {
    calm: 0.4,
    joy: 0.3,
    anxiety: 0.15,
    anger: 0.1,
    sadness: 0.05,
    timestamp: new Date().toISOString(),
  };
}

function generateMockChartData(): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      emotions: {
        calm: 0.3 + Math.random() * 0.3,
        joy: 0.2 + Math.random() * 0.2,
        anxiety: 0.1 + Math.random() * 0.2,
        anger: 0.05 + Math.random() * 0.15,
        sadness: 0.05 + Math.random() * 0.1,
        timestamp: timestamp.toISOString(),
      },
    });
  }
  return data;
}

