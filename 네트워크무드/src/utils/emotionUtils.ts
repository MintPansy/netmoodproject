import { EmotionData, EmotionType, HealthScore } from '@/types';

/**
 * 감정 데이터를 기반으로 건강도 점수 계산
 */
export const calculateHealthScore = (emotions: EmotionData): HealthScore => {
  const { calm, joy, anxiety, anger, sadness } = emotions;

  // 평온과 기쁨은 긍정적, 불안/화남/슬픔은 부정적
  const positiveScore = (calm + joy) * 10; // 0-20 범위
  const negativeScore = (anxiety + anger + sadness) * 10; // 0-30 범위

  // 건강도 점수 계산 (1-10 스케일)
  let score = Math.round(positiveScore - negativeScore * 0.5);
  score = Math.max(1, Math.min(10, score)); // 1-10 범위로 제한

  let status: HealthScore['status'];
  let message: string;

  if (score >= 8) {
    status = 'excellent';
    message = '네트워크 상태가 매우 양호합니다.';
  } else if (score >= 6) {
    status = 'good';
    message = '네트워크 상태가 양호합니다.';
  } else if (score >= 4) {
    status = 'warning';
    message = '네트워크에 일부 불안정한 패턴이 감지되었습니다. 지속적인 모니터링을 권장합니다.';
  } else {
    status = 'critical';
    message = '네트워크 상태가 불안정합니다. 즉시 조치가 필요합니다.';
  }

  return {
    score,
    status,
    message,
  };
};

/**
 * 감정 타입에 따른 색상 반환
 */
export const getEmotionColor = (emotion: EmotionType): string => {
  const colors: Record<EmotionType, string> = {
    calm: '#4ECDC4',
    joy: '#FFD700',
    anxiety: '#9B59B6',
    anger: '#E74C3C',
    sadness: '#3498DB',
  };
  return colors[emotion];
};

/**
 * 감정 타입에 따른 이모지 반환
 */
export const getEmotionEmoji = (emotion: EmotionType): string => {
  const emojis: Record<EmotionType, string> = {
    calm: '😌',
    joy: '😊',
    anxiety: '😰',
    anger: '😡',
    sadness: '😢',
  };
  return emojis[emotion];
};

/**
 * 감정 타입에 따른 한국어 라벨 반환
 */
export const getEmotionLabel = (emotion: EmotionType): string => {
  const labels: Record<EmotionType, string> = {
    calm: '평온',
    joy: '기쁨',
    anxiety: '불안',
    anger: '화남',
    sadness: '슬픔',
  };
  return labels[emotion];
};

/**
 * 감정 데이터를 백분율로 변환
 */
export const normalizeEmotions = (emotions: EmotionData): EmotionData => {
  const total = emotions.calm + emotions.joy + emotions.anxiety + emotions.anger + emotions.sadness;
  if (total === 0) {
    return {
      ...emotions,
      calm: 0,
      joy: 0,
      anxiety: 0,
      anger: 0,
      sadness: 0,
    };
  }

  return {
    ...emotions,
    calm: emotions.calm / total,
    joy: emotions.joy / total,
    anxiety: emotions.anxiety / total,
    anger: emotions.anger / total,
    sadness: emotions.sadness / total,
  };
};

