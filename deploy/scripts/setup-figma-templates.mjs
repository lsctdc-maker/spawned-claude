#!/usr/bin/env node
/**
 * Figma 템플릿 자동 셋업 스크립트
 *
 * 실행법:
 *   node deploy/scripts/setup-figma-templates.mjs <FIGMA_FILE_URL>
 *
 * 예시:
 *   node deploy/scripts/setup-figma-templates.mjs "https://www.figma.com/design/AbCdEfGhIjKl/My-File"
 *
 * 동작:
 *   1. Figma REST API로 12개 프레임 PNG export
 *   2. Supabase Storage에 업로드
 *   3. DB figma_templates.bg_image_url 업데이트
 *   4. .env.local FIGMA_FILE_KEY 업데이트
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── .env.local 읽기 ───
function loadEnv() {
  const envPath = resolve(ROOT, '.env.local');
  const lines = readFileSync(envPath, 'utf-8').split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

// ─── Figma file key 추출 ───
function extractFileKey(urlOrKey) {
  // URL에서 추출: figma.com/design/{KEY}/... 또는 figma.com/file/{KEY}/...
  const match = urlOrKey.match(/figma\.com\/(?:design|file)\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  // 이미 key 자체인 경우
  if (/^[a-zA-Z0-9_-]{10,}$/.test(urlOrKey)) return urlOrKey;
  throw new Error(`올바른 Figma URL 또는 파일 키를 입력하세요: ${urlOrKey}`);
}

// ─── 12개 프레임 정의 ───
const FRAMES = [
  { nodeId: '7:36',   name: 'sec-01-hero-asymmetric',     dbName: '히어로-비대칭' },
  { nodeId: '8:61',   name: 'sec-02-hero-image-centric',  dbName: '히어로-이미지중심' },
  { nodeId: '8:81',   name: 'sec-03-promotion',           dbName: '프로모션-특가' },
  { nodeId: '8:99',   name: 'sec-04-point-description',   dbName: '포인트설명' },
  { nodeId: '8:107',  name: 'sec-05-feature-3col',        dbName: '특징3컬럼' },
  { nodeId: '12:124', name: 'sec-06-hashtag-circle',      dbName: '해시태그-이미지' },
  { nodeId: '13:152', name: 'sec-07-hero-dark-tech',      dbName: '히어로-다크테크' },
  { nodeId: '13:180', name: 'sec-08-ingredient-grid',     dbName: '성분-원료그리드' },
  { nodeId: '13:203', name: 'sec-09-price-compare',       dbName: '가격비교-프로모션' },
  { nodeId: '14:239', name: 'sec-10-hero-data-emphasis',   dbName: '메인히어로-데이터강조' },
  { nodeId: '14:259', name: 'sec-11-numbered-points',     dbName: '상품설명-넘버링포인트' },
  { nodeId: '14:282', name: 'sec-12-cert-spec',           dbName: '인증-보증-스펙' },
];

// ─── Figma REST API: 이미지 export URL 가져오기 ───
async function getFigmaExportUrls(fileKey, token, nodeIds) {
  const ids = nodeIds.join(',');
  const url = `https://api.figma.com/v1/images/${fileKey}?ids=${ids}&format=png&scale=1`;
  console.log(`📡 Figma API 호출: ${nodeIds.length}개 프레임 export 요청...`);

  const res = await fetch(url, {
    headers: { 'X-Figma-Token': token },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Figma API 에러 (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (data.err) throw new Error(`Figma export 에러: ${data.err}`);

  return data.images; // { "7:36": "https://...", ... }
}

// ─── PNG 다운로드 ───
async function downloadPng(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`다운로드 실패: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ─── Supabase Storage 업로드 ───
async function uploadToStorage(supabaseUrl, serviceKey, fileName, pngBuffer) {
  const uploadUrl = `${supabaseUrl}/storage/v1/object/templates/${fileName}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'image/png',
      'x-upsert': 'true', // 덮어쓰기 허용
    },
    body: pngBuffer,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Storage 업로드 실패 (${res.status}): ${text}`);
  }

  // Public URL 반환
  return `${supabaseUrl}/storage/v1/object/public/templates/${fileName}`;
}

// ─── Supabase DB 업데이트 ───
async function updateDbImageUrl(supabaseUrl, serviceKey, templateName, imageUrl, nodeId) {
  const res = await fetch(`${supabaseUrl}/rest/v1/figma_templates?name=eq.${encodeURIComponent(templateName)}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
      'apikey': serviceKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      bg_image_url: imageUrl,
      figma_node_id: nodeId,
      figma_last_synced: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.warn(`  ⚠️  DB 업데이트 실패 (${templateName}): ${text}`);
  }
}

// ─── .env.local 업데이트 ───
function updateEnvFileKey(fileKey) {
  const envPath = resolve(ROOT, '.env.local');
  let content = readFileSync(envPath, 'utf-8');
  content = content.replace(
    /FIGMA_FILE_KEY=.*/,
    `FIGMA_FILE_KEY=${fileKey}`
  );
  writeFileSync(envPath, content, 'utf-8');
  console.log(`📝 .env.local FIGMA_FILE_KEY 업데이트 완료`);
}

// ─── 메인 ───
async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error(`
╔══════════════════════════════════════════════════╗
║  Figma 템플릿 자동 셋업                          ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  사용법:                                         ║
║    node deploy/scripts/setup-figma-templates.mjs ║
║    "<Figma 파일 URL>"                            ║
║                                                  ║
║  Figma 파일 URL은 브라우저 주소창에서 복사하세요  ║
║                                                  ║
╚══════════════════════════════════════════════════╝
`);
    process.exit(1);
  }

  const env = loadEnv();
  const fileKey = extractFileKey(arg);
  const figmaToken = env.FIGMA_API_TOKEN;
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!figmaToken || figmaToken === 'xxx') {
    console.error('❌ FIGMA_API_TOKEN이 .env.local에 설정되지 않았습니다.');
    process.exit(1);
  }

  console.log(`\n🚀 Figma 템플릿 셋업 시작`);
  console.log(`   File key: ${fileKey}`);
  console.log(`   프레임 수: ${FRAMES.length}개\n`);

  // 1. Figma export URLs 가져오기
  const nodeIds = FRAMES.map(f => f.nodeId);
  const exportUrls = await getFigmaExportUrls(fileKey, figmaToken, nodeIds);

  const available = Object.keys(exportUrls).filter(k => exportUrls[k]);
  console.log(`✅ Figma export URL ${available.length}/${FRAMES.length}개 획득\n`);

  // 2. 각 프레임: 다운로드 → 업로드 → DB 업데이트
  let success = 0;
  let failed = 0;

  for (const frame of FRAMES) {
    const exportUrl = exportUrls[frame.nodeId];
    if (!exportUrl) {
      console.log(`  ❌ ${frame.name}: export URL 없음 (nodeId: ${frame.nodeId})`);
      failed++;
      continue;
    }

    try {
      // 다운로드
      process.stdout.write(`  ⬇️  ${frame.name} 다운로드...`);
      const pngBuffer = await downloadPng(exportUrl);
      process.stdout.write(` ${(pngBuffer.length / 1024).toFixed(0)}KB`);

      // 업로드
      process.stdout.write(` → 업로드...`);
      const fileName = `${frame.name}.png`;
      const publicUrl = await uploadToStorage(supabaseUrl, serviceKey, fileName, pngBuffer);

      // DB 업데이트
      process.stdout.write(` → DB...`);
      await updateDbImageUrl(supabaseUrl, serviceKey, frame.dbName, publicUrl, frame.nodeId);

      console.log(` ✅`);
      success++;
    } catch (e) {
      console.log(` ❌ ${e.message}`);
      failed++;
    }
  }

  // 3. .env.local 업데이트
  updateEnvFileKey(fileKey);

  // 4. figma_file_key DB 일괄 업데이트
  try {
    await fetch(`${supabaseUrl}/rest/v1/figma_templates?figma_file_key=eq.pending`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ figma_file_key: fileKey }),
    });
  } catch {}

  console.log(`
╔══════════════════════════════════════════════════╗
║  셋업 완료!                                      ║
╠══════════════════════════════════════════════════╣
║  성공: ${String(success).padStart(2)}개 / 실패: ${String(failed).padStart(2)}개                        ║
║                                                  ║
║  테스트:                                         ║
║  → https://spawned-claude.vercel.app/seed        ║
║                                                  ║
╚══════════════════════════════════════════════════╝
`);
}

main().catch(e => {
  console.error(`\n💥 치명적 에러: ${e.message}`);
  process.exit(1);
});
