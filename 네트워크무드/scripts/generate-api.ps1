# PowerShell용 OpenAPI Generator 스크립트
# npm run generate:api 대신 이 스크립트를 직접 실행할 수도 있습니다.

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$openapiFile = Join-Path $projectRoot "openapi.yaml"
$outputDir = Join-Path $projectRoot "src\generated\api"

# OpenAPI 파일 확인
if (-not (Test-Path $openapiFile)) {
    Write-Host "❌ openapi.yaml 파일을 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "   경로: $openapiFile" -ForegroundColor Yellow
    exit 1
}

# 출력 디렉토리 생성
if (-not (Test-Path $outputDir)) {
    Write-Host "📁 출력 디렉토리 생성 중..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# 기존 파일 정리
if (Test-Path $outputDir) {
    Write-Host "🧹 기존 생성 파일 정리 중..." -ForegroundColor Cyan
    Get-ChildItem -Path $outputDir -Exclude ".gitkeep" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "🚀 OpenAPI 클라이언트 생성 중..." -ForegroundColor Green
Write-Host "   입력: $openapiFile" -ForegroundColor Gray
Write-Host "   출력: $outputDir" -ForegroundColor Gray

try {
    Write-Host "`n📦 OpenAPI Generator 실행 중... (처음 실행 시 다운로드 시간이 걸릴 수 있습니다)" -ForegroundColor Cyan
    
    # npx 명령어 실행
    $command = "npx --yes @openapitools/openapi-generator-cli generate -i `"$openapiFile`" -g typescript-fetch -o `"$outputDir`" --additional-properties=typescriptThreePlus=true,supportsES6=true,withInterfaces=true,enumPropertyNaming=original"
    
    Push-Location $projectRoot
    Invoke-Expression $command
    
    Write-Host "`n✅ API 클라이언트 생성 완료!" -ForegroundColor Green
    Write-Host "   생성 위치: $outputDir" -ForegroundColor Gray
    Write-Host "`n📝 사용 방법:" -ForegroundColor Cyan
    Write-Host "   import { DefaultApi, Configuration } from `"@/generated/api`";" -ForegroundColor Yellow
    Write-Host "   const api = new DefaultApi(new Configuration({ basePath: `"...`" }));" -ForegroundColor Yellow
    Write-Host "`n💡 다음 단계:" -ForegroundColor Cyan
    Write-Host "   npm run type-check  # 타입 체크 실행" -ForegroundColor Yellow
    
} catch {
    Write-Host "`n❌ API 클라이언트 생성 실패:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`n💡 문제 해결:" -ForegroundColor Yellow
    Write-Host "   1. Node.js 버전 확인 (18.x 이상 권장)" -ForegroundColor Gray
    Write-Host "   2. npm install 실행" -ForegroundColor Gray
    Write-Host "   3. openapi.yaml 파일 문법 확인" -ForegroundColor Gray
    exit 1
} finally {
    Pop-Location
}

