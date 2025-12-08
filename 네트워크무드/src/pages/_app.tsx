import type { AppProps } from 'next/app';
import { NextIntlClientProvider } from 'next-intl';
import { ReactQueryProvider } from '@/lib/react-query';
import { themeClass } from '@/styles/theme.css';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={themeClass}>
      <NextIntlClientProvider messages={pageProps.messages}>
        <ReactQueryProvider>
          <Component {...pageProps} />
        </ReactQueryProvider>
      </NextIntlClientProvider>
    </div>
  );
}
