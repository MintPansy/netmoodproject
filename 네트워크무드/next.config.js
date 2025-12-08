const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
const createNextIntlPlugin = require('next-intl/plugin');

const withVanillaExtract = createVanillaExtractPlugin();
const withNextIntl = createNextIntlPlugin('./src/i18n/config.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false, // pages directory 사용
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000',
  },
  // 이미지 최적화
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // 성능 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 번들 최적화
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = withNextIntl(withVanillaExtract(nextConfig));
