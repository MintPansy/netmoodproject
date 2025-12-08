import React from 'react';
import { EmotionType } from '@/types';
import { getEmotionColor, getEmotionEmoji, getEmotionLabel } from '@/utils/emotionUtils';
import * as styles from './EmotionCard.css';

interface EmotionCardProps {
  emotion: EmotionType;
  value: number; // 0-1 범위의 비율
  intensity?: number; // 0-10 범위의 강도
}

export const EmotionCard: React.FC<EmotionCardProps> = ({ emotion, value, intensity }) => {
  const percentage = Math.round(value * 100);
  const color = getEmotionColor(emotion);
  const emoji = getEmotionEmoji(emotion);
  const label = getEmotionLabel(emotion);

  return (
    <div className={styles.card} style={{ borderColor: color }}>
      <div className={styles.header}>
        <span className={styles.emoji}>{emoji}</span>
        <div className={styles.info}>
          <h3 className={styles.title}>{label}</h3>
          <span className={styles.englishLabel}>{emotion}</span>
        </div>
      </div>
      <div className={styles.valueContainer}>
        <div className={styles.percentage}>{percentage}%</div>
        {intensity !== undefined && (
          <div className={styles.intensity}>강도: {intensity}/10</div>
        )}
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <p className={styles.message}>
        {getEmotionMessage(emotion, percentage)}
      </p>
    </div>
  );
};

const getEmotionMessage = (emotion: EmotionType, percentage: number): string => {
  const messages: Record<EmotionType, { high: string; medium: string; low: string }> = {
    calm: {
      high: '네트워크가 매우 안정적입니다.',
      medium: '네트워크가 비교적 안정적입니다.',
      low: '네트워크 안정성을 모니터링하세요.',
    },
    joy: {
      high: '네트워크 성능이 우수합니다.',
      medium: '네트워크가 정상적으로 작동 중입니다.',
      low: '네트워크 상태를 확인하세요.',
    },
    anxiety: {
      high: '네트워크에 불안정한 패턴이 감지되었습니다.',
      medium: '일부 불안정한 패턴이 있습니다.',
      low: '네트워크가 비교적 안정적입니다.',
    },
    anger: {
      high: '네트워크에 심각한 문제가 감지되었습니다.',
      medium: '네트워크에 문제가 있을 수 있습니다.',
      low: '네트워크 상태가 양호합니다.',
    },
    sadness: {
      high: '네트워크 성능이 저하되고 있습니다.',
      medium: '네트워크 성능에 주의가 필요합니다.',
      low: '네트워크가 정상적으로 작동 중입니다.',
    },
  };

  const category = percentage >= 30 ? 'high' : percentage >= 15 ? 'medium' : 'low';
  return messages[emotion][category];
};

