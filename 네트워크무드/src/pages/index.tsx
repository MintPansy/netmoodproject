import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import * as styles from '@/pages/index.css';

export default function Home() {
  const router = useRouter();

  React.useEffect(() => {
    // 대시보드로 리다이렉트
    router.push('/dashboard');
  }, [router]);

  return (
    <>
      <Head>
        <title>NetMood Analyzer</title>
        <meta name="description" content="네트워크 트래픽을 감정으로 분석하는 AI 대시보드" />
      </Head>
      <div className={styles.container}>
        <p>대시보드로 이동 중...</p>
      </div>
    </>
  );
}

