# NetMood Analyzer - 엔터프라이즈급 프론트엔드

네트워크 트래픽을 감정으로 분석하는 AI 대시보드 (Next.js + TypeScript + React)

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── EmotionCard/    # 감정 카드 컴포넌트
│   └── HealthScoreCard/# 건강도 카드 컴포넌트
├── hooks/              # Custom Hooks
│   ├── useEmotionAnalysis.ts
│   ├── useRealtime.ts
│   ├── useSocket.ts
│   └── useAnalysisHistory.ts
├── pages/              # Next.js 페이지
│   ├── _app.tsx
│   └── index.tsx
├── services/           # API 클라이언트
│   └── api.ts
├── styles/             # 스타일 시스템
│   ├── theme.css.ts    # 디자인 토큰
│   └── globals.css
├── types/              # TypeScript 타입 정의
│   └── index.ts
└── utils/              # 유틸리티 함수
    ├── emotionUtils.ts
    └── dateUtils.ts
```

## 🛠️ 기술 스택

### Core
- **Next.js 14** - React 프레임워크
- **TypeScript** - 타입 안정성
- **React 18** - UI 라이브러리

### 상태 관리 & 데이터 페칭
- **React Query** - 서버 상태 관리
- **Custom Hooks** - 비즈니스 로직 추상화

### 스타일링
- **vanilla-extract** - CSS-in-JS (스타일 격리)
- **CSS Variables** - 디자인 토큰

### 실시간 통신
- **Socket.io Client** - WebSocket 연결

### UI 컴포넌트
- **Radix UI** - 접근성 높은 컴포넌트 (추가 예정)

## 📝 주요 기능

### 1. 감정 분석
- 5가지 감정 카드 (평온, 기쁨, 불안, 화남, 슬픔)
- 실시간 감정 데이터 업데이트
- 감정별 비율 및 강도 표시

### 2. 네트워크 건강도
- 1-10점 스케일 건강도 점수
- 상태별 색상 코딩
- 네트워크 통계 (데이터 포인트, 활성 연결, 위험 수준)

### 3. 실시간 모니터링
- WebSocket 기반 실시간 업데이트
- 자동 재연결
- 데이터 버퍼링

## 🔧 개발

### 타입 체크

```bash
npm run type-check
```

### 린트

```bash
npm run lint
```

### 테스트

```bash
npm test
npm run test:watch
npm run test:coverage
```

## 🌐 환경 변수

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

## 📦 빌드 최적화

- Next.js 자동 코드 스플리팅
- SWC 최소화
- 이미지 최적화
- 정적 페이지 생성 (SSG)

## 🔄 마이그레이션 가이드

기존 Vanilla JS 프로젝트에서 마이그레이션하는 방법은 [MIGRATION.md](./MIGRATION.md)를 참조하세요.

## 📄 라이선스

MIT

