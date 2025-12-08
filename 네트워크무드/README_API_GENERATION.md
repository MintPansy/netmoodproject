# API 클라이언트 자동 생성 가이드

## 개요

OpenAPI 스펙 파일(`openapi.yaml`)로부터 TypeScript API 클라이언트를 자동 생성합니다.

## 사용 방법

### 1. API 클라이언트 생성

```bash
npm run generate:api
```

이 명령어는 다음을 수행합니다:
- `openapi.yaml` 파일을 읽어서 API 스펙을 파싱
- TypeScript Fetch 클라이언트 생성
- `src/generated/api` 디렉토리에 파일 생성

### 2. 생성 후 타입 체크

```bash
npm run generate:api:clean
```

이 명령어는 API 생성 후 타입 체크까지 수행합니다.

## 생성되는 파일

생성된 파일들은 `src/generated/api` 디렉토리에 위치합니다:

```
src/generated/api/
├── apis/
│   └── DefaultApi.ts        # API 메서드들
├── models/                  # 타입 정의
│   ├── EmotionData.ts
│   ├── HealthScore.ts
│   ├── NetworkStats.ts
│   └── ...
├── index.ts                 # 메인 export
└── configuration.ts         # 설정
```

## 사용 예시

### 기본 사용

```typescript
import { DefaultApi, Configuration } from '@/generated/api';

// API 인스턴스 생성
const config = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
});

const api = new DefaultApi(config);

// API 호출
const healthData = await api.getHealthData();
console.log(healthData);
```

### React Query와 함께 사용

```typescript
import { useQuery } from '@tanstack/react-query';
import { DefaultApi, Configuration } from '@/generated/api';

const api = new DefaultApi(
  new Configuration({
    basePath: process.env.NEXT_PUBLIC_API_URL,
  })
);

export const useHealthData = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.getHealthData(),
  });
};
```

## OpenAPI 스펙 수정

`openapi.yaml` 파일을 수정한 후:

1. 스펙 파일 검증 (선택사항):
   ```bash
   # OpenAPI 스펙 검증 도구 사용 가능
   ```

2. API 클라이언트 재생성:
   ```bash
   npm run generate:api
   ```

3. 타입 체크:
   ```bash
   npm run type-check
   ```

## 문제 해결

### 오류: "openapi.yaml 파일을 찾을 수 없습니다"

- 프로젝트 루트에 `openapi.yaml` 파일이 있는지 확인하세요.

### 오류: "OpenAPI Generator CLI를 찾을 수 없습니다"

- 의존성 설치:
  ```bash
  npm install
  ```

### 생성된 파일에 타입 오류가 있습니다

1. OpenAPI 스펙 파일의 문법 확인
2. enum 값들이 올바르게 정의되어 있는지 확인
3. 스키마 참조(`$ref`)가 올바른지 확인

### Windows에서 경로 오류

스크립트는 Windows와 Unix 모두에서 작동하도록 설계되었습니다. 
문제가 발생하면:
- Node.js 버전 확인 (18.x 이상 권장)
- 관리자 권한으로 실행 시도

## 주의사항

- 생성된 파일들은 `.gitignore`에 포함되어 있어 커밋되지 않습니다.
- 팀원들은 각자 `npm run generate:api`를 실행해야 합니다.
- CI/CD 파이프라인에서도 API 생성 단계를 포함하는 것을 권장합니다.

## CI/CD 통합

GitHub Actions 예시:

```yaml
- name: Generate API Client
  run: npm run generate:api

- name: Type Check
  run: npm run type-check
```

## 참고 자료

- [OpenAPI Generator 문서](https://openapi-generator.tech/)
- [TypeScript Fetch Generator](https://openapi-generator.tech/docs/generators/typescript-fetch)

