import React from 'react';
import { HealthScore, NetworkStats } from '@/types';
import * as styles from './HealthScoreCard.css';

interface HealthScoreCardProps {
  healthScore: HealthScore;
  networkStats: NetworkStats;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
  healthScore,
  networkStats,
}) => {
  const statusConfig = getStatusConfig(healthScore.status);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>네트워크 건강도</h2>
      </div>
      <div className={styles.scoreContainer}>
        <div
          className={styles.score}
          style={{ color: statusConfig.color }}
        >
          {healthScore.score}
        </div>
        <div
          className={styles.status}
          style={{ color: statusConfig.color }}
        >
          {getStatusLabel(healthScore.status)}
        </div>
        <p className={styles.message}>{healthScore.message}</p>
      </div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>{networkStats.totalDataPoints}</div>
          <div className={styles.statLabel}>분석 데이터</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{networkStats.activeConnections}</div>
          <div className={styles.statLabel}>활성 연결</div>
        </div>
        <div className={styles.stat}>
          <div
            className={styles.statValue}
            style={{ color: getThreatColor(networkStats.threatLevel) }}
          >
            {getThreatLabel(networkStats.threatLevel)}
          </div>
          <div className={styles.statLabel}>위험 수준</div>
        </div>
      </div>
    </div>
  );
};

const getStatusConfig = (status: HealthScore['status']) => {
  const configs = {
    excellent: { color: '#10B981', label: '우수' },
    good: { color: '#3B82F6', label: '양호' },
    warning: { color: '#F59E0B', label: '주의 필요' },
    critical: { color: '#EF4444', label: '위험' },
  };
  return configs[status];
};

const getStatusLabel = (status: HealthScore['status']): string => {
  return getStatusConfig(status).label;
};

const getThreatColor = (level: NetworkStats['threatLevel']): string => {
  const colors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
  };
  return colors[level];
};

const getThreatLabel = (level: NetworkStats['threatLevel']): string => {
  const labels = {
    low: '낮음',
    medium: '중간',
    high: '높음',
  };
  return labels[level];
};

