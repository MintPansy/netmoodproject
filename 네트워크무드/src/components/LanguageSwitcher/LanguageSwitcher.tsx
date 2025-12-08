'use client';

import React from 'react';
import { useRouter } from 'next/router';
import { useLocale } from 'next-intl';
import * as styles from './LanguageSwitcher.css';

const locales = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
] as const;

export const LanguageSwitcher: React.FC = () => {
  const router = useRouter();
  const locale = useLocale();

  const handleLanguageChange = (newLocale: string) => {
    // 현재 경로에서 locale 제거 후 새 locale 추가
    const pathWithoutLocale = router.asPath.replace(`/${locale}`, '') || '/';
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className={styles.container}>
      {locales.map((loc) => (
        <button
          key={loc.code}
          className={`${styles.button} ${locale === loc.code ? styles.active : ''}`}
          onClick={() => handleLanguageChange(loc.code)}
          aria-label={`Switch to ${loc.label}`}
        >
          <span className={styles.flag}>{loc.flag}</span>
          <span className={styles.label}>{loc.label}</span>
        </button>
      ))}
    </div>
  );
};

