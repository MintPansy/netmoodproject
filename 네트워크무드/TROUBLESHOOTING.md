# 문제 해결 가이드

## npm run generate:api 실행 시 문제

### 1. PowerShell 오류: `@powershell (511-988)`

이 메시지는 PowerShell 실행 정책 문제이거나 경로 문제일 수 있습니다.

#### 해결 방법 A: 실행 정책 변경
```powershell
# 현재 세션에서만 실행 정책 변경
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# 그 다음 스크립트 실행
npm run generate:api
```

#### 해결 방법 B: CMD 사용
PowerShell 대신 CMD를 사용:
```cmd
cmd
npm run generate:api
```

#### 해결 방법 C: PowerShell 스크립트 직접 실행
```powershell
.\scripts\generate-api.ps1
```

### 2. 경로에 공백이 있는 경우

프로젝트 경로에 공백이 있으면 (`바탕 화면` 등) 문제가 발생할 수 있습니다.

#### 해결 방법:
1. **프로젝트를 공백 없는 경로로 이동** (권장)
   ```
   C:\Users\goni1\OneDrive\Desktop\q\network-mood
   ```

2. **또는 경로를 따옴표로 감싸기**
   - 스크립트는 자동으로 처리하지만, 수동 실행 시:
   ```powershell
   cd "C:\Users\goni1\OneDrive\바탕 화면\q\네트워크무드"
   npm run generate:api
   ```

### 3. "openapi.yaml 파일을 찾을 수 없습니다"

#### 확인 사항:
- 프로젝트 루트에 `openapi.yaml` 파일이 있는지 확인
- 현재 디렉토리가 프로젝트 루트인지 확인:
  ```powershell
  pwd
  ls openapi.yaml
  ```

### 4. "OpenAPI Generator CLI를 찾을 수 없습니다"

#### 해결 방법:
```bash
# 의존성 재설치
npm install

# 또는 전역 설치
npm install -g @openapitools/openapi-generator-cli
```

### 5. Java 관련 오류

OpenAPI Generator는 Java가 필요할 수 있습니다.

#### 확인:
```powershell
java -version
```

#### Java 설치:
- [OpenJDK 다운로드](https://adoptium.net/)
- 또는 Chocolatey 사용:
  ```powershell
  choco install openjdk
  ```

### 6. 메모리 부족 오류

#### 해결 방법:
```powershell
# Node.js 메모리 제한 증가
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run generate:api
```

### 7. 권한 오류

#### 해결 방법:
- 관리자 권한으로 PowerShell 실행
- 또는 프로젝트 폴더 권한 확인

## 일반적인 디버깅

### 1. 상세 로그 확인
스크립트는 자동으로 상세한 오류 메시지를 출력합니다. 
오류 메시지의 전체 내용을 확인하세요.

### 2. 수동 실행
```powershell
# Node.js 스크립트 직접 실행
node scripts/generate-api.js

# 또는 PowerShell 스크립트 실행
.\scripts\generate-api.ps1
```

### 3. 환경 확인
```powershell
# Node.js 버전
node --version

# npm 버전
npm --version

# 현재 디렉토리
pwd

# OpenAPI 파일 확인
Test-Path openapi.yaml
```

## 여전히 문제가 있나요?

1. **전체 오류 메시지 복사**: 터미널의 전체 오류 메시지를 복사하세요
2. **환경 정보 확인**: Node.js 버전, OS 버전, PowerShell 버전
3. **스크립트 수동 실행**: `node scripts/generate-api.js` 직접 실행
4. **로그 파일 확인**: 오류가 파일로 저장되었는지 확인

## 대안: 수동 생성

자동 생성이 계속 실패하면, 수동으로 API 클라이언트를 생성할 수 있습니다:

```bash
# Docker 사용 (Java 불필요)
docker run --rm -v ${PWD}:/local openapitools/openapi-generator-cli generate \
  -i /local/openapi.yaml \
  -g typescript-fetch \
  -o /local/src/generated/api
```

