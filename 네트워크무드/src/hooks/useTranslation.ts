import { useTranslations } from 'next-intl';

/**
 * 타입 안전한 번역 Hook
 */
export const useAppTranslations = () => {
  const t = useTranslations();

  return {
    common: {
      loading: t('common.loading'),
      error: t('common.error'),
      success: t('common.success'),
      cancel: t('common.cancel'),
      confirm: t('common.confirm'),
      close: t('common.close'),
    },
    dashboard: {
      title: t('dashboard.title'),
      subtitle: t('dashboard.subtitle'),
      overview: t('dashboard.overview'),
      analysis: t('dashboard.analysis'),
      upload: t('dashboard.upload'),
    },
    emotions: {
      labels: {
        calm: t('emotions.labels.calm'),
        joy: t('emotions.labels.joy'),
        anxiety: t('emotions.labels.anxiety'),
        anger: t('emotions.labels.anger'),
        sadness: t('emotions.labels.sadness'),
      },
      messages: {
        calm: {
          high: t('emotions.messages.calm.high'),
          medium: t('emotions.messages.calm.medium'),
          low: t('emotions.messages.calm.low'),
        },
        joy: {
          high: t('emotions.messages.joy.high'),
          medium: t('emotions.messages.joy.medium'),
          low: t('emotions.messages.joy.low'),
        },
        anxiety: {
          high: t('emotions.messages.anxiety.high'),
          medium: t('emotions.messages.anxiety.medium'),
          low: t('emotions.messages.anxiety.low'),
        },
        anger: {
          high: t('emotions.messages.anger.high'),
          medium: t('emotions.messages.anger.medium'),
          low: t('emotions.messages.anger.low'),
        },
        sadness: {
          high: t('emotions.messages.sadness.high'),
          medium: t('emotions.messages.sadness.medium'),
          low: t('emotions.messages.sadness.low'),
        },
      },
    },
    health: {
      title: t('health.title'),
      status: {
        excellent: t('health.status.excellent'),
        good: t('health.status.good'),
        warning: t('health.status.warning'),
        critical: t('health.status.critical'),
      },
      stats: {
        dataPoints: t('health.stats.dataPoints'),
        activeConnections: t('health.stats.activeConnections'),
        threatLevel: t('health.stats.threatLevel'),
      },
      threatLevel: {
        low: t('health.threatLevel.low'),
        medium: t('health.threatLevel.medium'),
        high: t('health.threatLevel.high'),
      },
    },
    chart: {
      title: t('chart.title'),
      timeRange: {
        '3h': t('chart.timeRange.3h'),
        '1d': t('chart.timeRange.1d'),
        '1w': t('chart.timeRange.1w'),
        '1m': t('chart.timeRange.1m'),
        '3m': t('chart.timeRange.3m'),
      },
      stats: {
        dataPoints: t('chart.stats.dataPoints'),
        timeRange: t('chart.stats.timeRange'),
      },
      empty: t('chart.empty'),
    },
    upload: {
      title: t('upload.title'),
      dragDrop: t('upload.dragDrop'),
      format: (maxSize: number) => t('upload.format', { maxSize }),
      uploading: t('upload.uploading'),
      progress: (progress: number) => t('upload.progress', { progress }),
      success: {
        title: t('upload.success.title'),
        message: t('upload.success.message'),
      },
      error: {
        title: t('upload.error.title'),
        message: t('upload.error.message'),
      },
    },
    alerts: {
      threat: {
        title: t('alerts.threat.title'),
        anger: t('alerts.threat.anger'),
        anxiety: t('alerts.threat.anxiety'),
      },
    },
  } as const;
};

