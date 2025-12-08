#!/usr/bin/env node

/**
 * i18n 번역 파일 동기화 스크립트
 * 한국어 파일을 기준으로 영어, 일본어 파일의 누락된 키를 감지
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../locales');
const baseLocale = 'ko.json';

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

function main() {
  const basePath = path.join(localesDir, baseLocale);
  const baseContent = JSON.parse(fs.readFileSync(basePath, 'utf8'));
  const baseKeys = getAllKeys(baseContent);

  const otherLocales = ['en.json', 'ja.json'];
  let hasChanges = false;

  for (const localeFile of otherLocales) {
    const localePath = path.join(localesDir, localeFile);
    let localeContent = {};

    if (fs.existsSync(localePath)) {
      localeContent = JSON.parse(fs.readFileSync(localePath, 'utf8'));
    }

    const localeKeys = getAllKeys(localeContent);
    const missingKeys = baseKeys.filter((key) => !localeKeys.includes(key));

    if (missingKeys.length > 0) {
      console.log(`\n⚠️  ${localeFile}에 누락된 키 발견:`);
      for (const key of missingKeys) {
        console.log(`   - ${key}`);
        // 기본값으로 설정 (실제로는 번역이 필요)
        setNestedValue(localeContent, key, `[TRANSLATE: ${key}]`);
      }
      fs.writeFileSync(localePath, JSON.stringify(localeContent, null, 2) + '\n', 'utf8');
      hasChanges = true;
      console.log(`✅ ${localeFile} 업데이트 완료`);
    } else {
      console.log(`✅ ${localeFile} 모든 키가 동기화되어 있습니다.`);
    }
  }

  if (hasChanges) {
    console.log('\n📝 번역 파일이 업데이트되었습니다. [TRANSLATE: ...] 부분을 실제 번역으로 교체해주세요.');
  } else {
    console.log('\n✨ 모든 번역 파일이 동기화되어 있습니다.');
  }
}

main();

