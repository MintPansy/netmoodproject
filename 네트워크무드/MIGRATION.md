# NetMood Analyzer 마이그레이션 가이드

## 개요

이 문서는 기존 Vanilla JS 기반 NetMood Analyzer를 Next.js + TypeScript + React 기반 엔터프라이즈 아키텍처로 마이그레이션하는 방법을 설명합니다.

## Phase 1: 기초 구축 ✅

### 완료된 작업

1. **Next.js 프로젝트 초기화**
   - TypeScript 설정 (strict 모드)
   - 프로젝트 구조 생성
   - 빌드 설정

2. **타입 시스템 구축**
   - `src/types/index.ts` - 모든 타입 정의
   - EmotionData, HealthScore, NetworkStats 등

3. **Custom Hooks 작성**
   - `useEmotionAnalysis` - 감정 분석 로직
   - `useRealtime` - 실시간 데이터 관리
   - `useSocket` - WebSocket 연결 관리
   - `useAnalysisHistory` - React Query 통합

4. **서비스 레이어**
   - `src/services/api.ts` - API 클라이언트
   - Axios 기반 HTTP 클라이언트
   - 에러 처리 및 인터셉터

5. **유틸리티 함수**
   - `emotionUtils.ts` - 감정 관련 계산
   - `dateUtils.ts` - 날짜/시간 포맷팅

6. **핵심 컴포넌트**
   - `EmotionCard` - 감정 카드 컴포넌트
   - `HealthScoreCard` - 건강도 카드 컴포넌트

### 다음 단계

기존 HTML 파일의 기능을 React 컴포넌트로 마이그레이션:

1. **대시보드 페이지** (`integrated-dashboard.html` → `src/pages/dashboard.tsx`)
2. **파일 업로드 컴포넌트** (`FileUpload.tsx` 개선)
3. **차트 컴포넌트** (Chart.js 통합)
4. **탭 네비게이션** (Radix UI Tabs 사용)

## Phase 2: 스타일링 및 DX

### vanilla-extract 설정

이미 설정 완료:
- `next.config.js`에 vanilla-extract 플러그인 추가
- `src/styles/theme.css.ts` - 디자인 토큰 정의

### 다음 작업

1. **Radix UI 컴포넌트 통합**
   - AlertDialog (경고 알림)
   - Dialog (모달)
   - DropdownMenu (메뉴)
   - Tabs (탭 네비게이션)

2. **반응형 디자인**
   - 모바일 최적화
   - 미디어 쿼리 추가

## Phase 3: API 및 번역

### OpenAPI 자동 생성

1. **OpenAPI Generator 설정**
   ```bash
   npm install -D @openapitools/openapi-generator-cli
   ```

2. **스크립트 추가** (`package.json`)
   ```json
   "scripts": {
     "generate:api": "openapi-generator-cli generate -i http://localhost:3000/openapi.json -g typescript-fetch -o ./src/generated/api"
   }
   ```

3. **자동 생성된 API 사용**
   - `src/services/api.ts`를 자동 생성된 코드로 교체

### i18n 설정

1. **next-intl 설치**
   ```bash
   npm install next-intl
   ```

2. **번역 파일 생성**
   - `src/locales/ko.json`
   - `src/locales/en.json`
   - `src/locales/ja.json`

3. **번역 Hook 사용**
   ```typescript
   import { useTranslations } from 'next-intl';
   
   const t = useTranslations();
   <h1>{t('dashboard.title')}</h1>
   ```

## Phase 4: 테스트 및 모니터링

### Jest 설정

이미 설정 완료:
- `jest.config.js`
- `jest.setup.js`

### 다음 작업

1. **컴포넌트 테스트 작성**
   ```typescript
   // __tests__/components/EmotionCard.test.tsx
   import { render, screen } from '@testing-library/react';
   import { EmotionCard } from '@/components/EmotionCard/EmotionCard';
   
   describe('EmotionCard', () => {
     it('renders emotion data correctly', () => {
       render(<EmotionCard emotion="joy" value={0.5} />);
       expect(screen.getByText('기쁨')).toBeInTheDocument();
     });
   });
   ```

2. **Hook 테스트 작성**
   ```typescript
   // __tests__/hooks/useEmotionAnalysis.test.ts
   import { renderHook, waitFor } from '@testing-library/react';
   import { useEmotionAnalysis } from '@/hooks/useEmotionAnalysis';
   ```

3. **Storybook 설정**
   ```bash
   npx storybook@latest init
   ```

### Sentry 모니터링

1. **Sentry 설치**
   ```bash
   npm install @sentry/nextjs
   ```

2. **설정** (`src/pages/_app.tsx`)
   ```typescript
   import * as Sentry from "@sentry/nextjs";
   
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     tracesSampleRate: 0.1,
   });
   ```

## Phase 5: 배포 및 최적화

### Turborepo 모노레포

1. **프로젝트 구조**
   ```
   /packages
     /ui (공통 UI 컴포넌트)
     /core (비즈니스 로직)
   /apps
     /web (Next.js 앱)
   ```

2. **turbo.json 설정**
   ```json
   {
     "pipeline": {
       "build": {
         "dependsOn": ["^build"],
         "outputs": ["dist/**"]
       }
     }
   }
   ```

### GitHub Actions CI/CD

`.github/workflows/ci.yml` 파일 생성:

```yaml
name: CI/CD
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

### Module Federation (Micro-Frontend)

1. **webpack 설정** (`next.config.js`)
   ```javascript
   const withFederatedSidecar = require('@module-federation/nextjs-mf');
   
   module.exports = withFederatedSidecar({
     name: 'netmood_dashboard',
     filename: 'static/chunks/remoteEntry.js',
     exposes: {
       './EmotionChart': './components/EmotionChart',
     },
   })(nextConfig);
   ```

## 마이그레이션 체크리스트

### Phase 1 ✅
- [x] Next.js 프로젝트 초기화
- [x] TypeScript 설정
- [x] 프로젝트 구조 생성
- [x] Custom Hooks 작성
- [x] 타입 정의
- [x] API 서비스 레이어
- [x] 핵심 컴포넌트 (EmotionCard, HealthScoreCard)

### Phase 2 (진행 중)
- [x] vanilla-extract 설정
- [x] 디자인 토큰 정의
- [ ] Radix UI 컴포넌트 통합
- [ ] 반응형 디자인

### Phase 3 (예정)
- [ ] OpenAPI 자동 생성
- [ ] React Query 완전 통합
- [ ] i18n 설정

### Phase 4 (예정)
- [ ] Jest 테스트 작성
- [ ] Storybook 설정
- [ ] Sentry 모니터링

### Phase 5 (예정)
- [ ] Turborepo 모노레포
- [ ] GitHub Actions CI/CD
- [ ] Module Federation

## 문제 해결

### 타입 에러
```bash
npm run type-check
```

### 빌드 에러
```bash
rm -rf .next node_modules
npm install
npm run build
```

### 스타일 에러
vanilla-extract는 빌드 타임에 CSS를 생성하므로, 개발 서버를 재시작하세요.

## 참고 자료

- [Next.js 문서](https://nextjs.org/docs)
- [TypeScript 문서](https://www.typescriptlang.org/docs)
- [React Query 문서](https://tanstack.com/query/latest)
- [vanilla-extract 문서](https://vanilla-extract.style)
- [Radix UI 문서](https://www.radix-ui.com)

