#!/usr/bin/env node

/**
 * OpenAPI Generator 스크립트
 * API 클라이언트를 자동 생성합니다.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const openapiFile = path.resolve(__dirname, '../openapi.yaml');
const outputDir = path.resolve(__dirname, '../src/generated/api');

// OpenAPI 파일 존재 확인
if (!fs.existsSync(openapiFile)) {
  console.error('❌ openapi.yaml 파일을 찾을 수 없습니다.');
  console.error(`   경로: ${openapiFile}`);
  process.exit(1);
}

// 출력 디렉토리 생성
if (!fs.existsSync(outputDir)) {
  console.log('📁 출력 디렉토리 생성 중...');
  fs.mkdirSync(outputDir, { recursive: true });
}

// 기존 파일 삭제 (깨끗한 생성)
if (fs.existsSync(outputDir)) {
  console.log('🧹 기존 생성 파일 정리 중...');
  try {
    const files = fs.readdirSync(outputDir);
    files.forEach((file) => {
      // .gitkeep 파일은 유지
      if (file === '.gitkeep') return;
      
      const filePath = path.join(outputDir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.warn('⚠️  기존 파일 정리 중 오류 (무시하고 계속):', error.message);
  }
}

console.log('🚀 OpenAPI 클라이언트 생성 중...');
console.log(`   입력: ${openapiFile}`);
console.log(`   출력: ${outputDir}`);

try {
  // Windows와 Unix 모두에서 작동하도록 경로 정규화
  const normalizedOpenApiFile = openapiFile.replace(/\\/g, '/');
  const normalizedOutputDir = outputDir.replace(/\\/g, '/');
  
  // OpenAPI Generator 실행
  const command = `npx --yes @openapitools/openapi-generator-cli generate -i "${normalizedOpenApiFile}" -g typescript-fetch -o "${normalizedOutputDir}" --additional-properties=typescriptThreePlus=true,supportsES6=true,withInterfaces=true,enumPropertyNaming=original`;
  
  console.log('\n📦 OpenAPI Generator 실행 중... (처음 실행 시 다운로드 시간이 걸릴 수 있습니다)');
  
  execSync(command, {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096',
    },
    shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
  });

  console.log('\n✅ API 클라이언트 생성 완료!');
  console.log(`   생성 위치: ${outputDir}`);
  console.log('\n📝 사용 방법:');
  console.log('   import { DefaultApi, Configuration } from "@/generated/api";');
  console.log('   const api = new DefaultApi(new Configuration({ basePath: "..." }));');
  console.log('\n💡 다음 단계:');
  console.log('   npm run type-check  # 타입 체크 실행');
  
} catch (error) {
  console.error('\n❌ API 클라이언트 생성 실패:');
  if (error.message) {
    console.error(error.message);
  }
  if (error.stderr) {
    console.error('\n상세 오류:');
    console.error(error.stderr.toString());
  }
  console.error('\n💡 문제 해결:');
  console.error('   1. Node.js 버전 확인 (18.x 이상 권장)');
  console.error('   2. npm install 실행');
  console.error('   3. openapi.yaml 파일 문법 확인');
  process.exit(1);
}

