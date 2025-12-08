'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { EmotionData, TimeRange, ChartDataPoint } from '@/types';
import { getEmotionColor, getEmotionLabel } from '@/utils/emotionUtils';
import { formatDate, getTimeRangeFilter } from '@/utils/dateUtils';
import * as styles from './EmotionChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EmotionChartProps {
  data: ChartDataPoint[];
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  height?: number;
}

export const EmotionChart: React.FC<EmotionChartProps> = ({
  data,
  timeRange = '1d',
  onTimeRangeChange,
  height = 300,
}) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // 시간 범위에 따른 데이터 필터링
  const filteredData = useMemo(() => {
    if (!data.length) return [];
    const cutoff = getTimeRangeFilter(timeRange);
    return data.filter((point) => new Date(point.timestamp) >= cutoff);
  }, [data, timeRange]);

  // Chart.js 데이터 형식으로 변환
  const chartData = useMemo(() => {
    const labels = filteredData.map((point) =>
      formatDate(point.timestamp, 'short')
    );

    const emotionTypes: Array<keyof EmotionData> = [
      'calm',
      'joy',
      'anxiety',
      'anger',
      'sadness',
    ];

    const datasets = emotionTypes.map((emotion) => ({
      label: getEmotionLabel(emotion),
      data: filteredData.map((point) => point.emotions[emotion] * 100), // 백분율로 변환
      borderColor: getEmotionColor(emotion),
      backgroundColor: `${getEmotionColor(emotion)}20`,
      tension: 0.4,
      fill: false,
      pointRadius: 3,
      pointHoverRadius: 5,
    }));

    return {
      labels,
      datasets,
    };
  }, [filteredData]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          callbacks: {
            label: (context: any) => {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: '시간',
          },
          grid: {
            display: false,
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: '감정 비율 (%)',
          },
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value: any) => `${value}%`,
          },
        },
      },
      animation: {
        duration: 750,
        easing: 'easeInOutQuart' as const,
      },
    }),
    []
  );

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '3h', label: '3시간' },
    { value: '1d', label: '1일' },
    { value: '1w', label: '1주' },
    { value: '1m', label: '1달' },
    { value: '3m', label: '3달' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>감정 변화 추이</h3>
        <div className={styles.timeRangeSelector}>
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              className={`${styles.timeRangeButton} ${
                timeRange === option.value ? styles.active : ''
              }`}
              onClick={() => onTimeRangeChange?.(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.chartWrapper} style={{ height: `${height}px` }}>
        {filteredData.length > 0 ? (
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        ) : (
          <div className={styles.emptyState}>
            <p>데이터가 없습니다.</p>
          </div>
        )}
      </div>
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>데이터 포인트:</span>
          <span className={styles.statValue}>{filteredData.length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>시간 범위:</span>
          <span className={styles.statValue}>
            {timeRangeOptions.find((opt) => opt.value === timeRange)?.label}
          </span>
        </div>
      </div>
    </div>
  );
};

