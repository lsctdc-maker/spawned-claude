/**
 * 이미지 섹션 분리기
 * 긴 세로 상세페이지 이미지를 섹션 단위로 분리합니다.
 * sharp 기반 픽셀 행 분석으로 색상 전환 지점을 찾아 분리합니다.
 */
import sharp from 'sharp';

// ── 타입 ──

export interface SectionBoundary {
  startY: number;
  endY: number;
  height: number;
  /** 경계선의 평균 색상 (hex) */
  borderColor: string;
}

export interface SplitResult {
  sourceFile: string;
  width: number;
  height: number;
  sections: SectionBoundary[];
}

export interface SectionImageResult {
  index: number;
  boundary: SectionBoundary;
  /** PNG 이미지 Buffer */
  imageBuffer: Buffer;
}

// ── 메인 분리 로직 ──

export async function findSectionBoundaries(
  imageInput: Buffer | string,
  options: {
    /** 최소 섹션 높이 (px). 이보다 작은 섹션은 무시 */
    minSectionHeight?: number;
    /** 행의 색상 분산 임계값 (낮을수록 엄격) */
    colorVarianceThreshold?: number;
    /** 스캔 간격 (매 N번째 행만 검사) */
    scanStep?: number;
    /** 연속 균일 행 최소 개수 (경계로 인정) */
    minBandRows?: number;
  } = {},
): Promise<SplitResult> {
  const {
    minSectionHeight = 100,
    colorVarianceThreshold = 12,
    scanStep = 2,
    minBandRows = 3,
  } = options;

  const image = sharp(imageInput);
  const metadata = await image.metadata();
  const width = metadata.width!;
  const height = metadata.height!;

  // Raw RGBA 데이터
  const { data, info } = await image
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels; // 4 (RGBA)

  // 각 행의 색상 분산 계산
  interface RowInfo {
    y: number;
    avgR: number;
    avgG: number;
    avgB: number;
    variance: number;
  }

  const uniformRows: RowInfo[] = [];

  for (let y = 0; y < height; y += scanStep) {
    const rowOffset = y * width * channels;

    let sumR = 0, sumG = 0, sumB = 0;
    for (let x = 0; x < width; x++) {
      const px = rowOffset + x * channels;
      sumR += data[px];
      sumG += data[px + 1];
      sumB += data[px + 2];
    }

    const avgR = sumR / width;
    const avgG = sumG / width;
    const avgB = sumB / width;

    // 분산 계산
    let variance = 0;
    for (let x = 0; x < width; x++) {
      const px = rowOffset + x * channels;
      variance += Math.abs(data[px] - avgR)
                + Math.abs(data[px + 1] - avgG)
                + Math.abs(data[px + 2] - avgB);
    }
    variance /= (width * 3);

    if (variance < colorVarianceThreshold) {
      uniformRows.push({ y, avgR, avgG, avgB, variance });
    }
  }

  // 연속 균일 행을 경계 밴드로 그룹화
  const bands: { startY: number; endY: number; avgR: number; avgG: number; avgB: number }[] = [];
  let bandStart = -1;
  let bandCount = 0;
  let bandR = 0, bandG = 0, bandB = 0;

  for (let i = 0; i < uniformRows.length; i++) {
    const row = uniformRows[i];
    const prevRow = i > 0 ? uniformRows[i - 1] : null;

    const isContinuous = prevRow && (row.y - prevRow.y <= scanStep * 2);

    if (isContinuous) {
      bandCount++;
      bandR += row.avgR;
      bandG += row.avgG;
      bandB += row.avgB;
    } else {
      // 이전 밴드 저장
      if (bandCount >= minBandRows && bandStart >= 0) {
        bands.push({
          startY: bandStart,
          endY: uniformRows[i - 1].y,
          avgR: bandR / bandCount,
          avgG: bandG / bandCount,
          avgB: bandB / bandCount,
        });
      }
      // 새 밴드 시작
      bandStart = row.y;
      bandCount = 1;
      bandR = row.avgR;
      bandG = row.avgG;
      bandB = row.avgB;
    }
  }

  // 마지막 밴드
  if (bandCount >= minBandRows && bandStart >= 0) {
    bands.push({
      startY: bandStart,
      endY: uniformRows[uniformRows.length - 1].y,
      avgR: bandR / bandCount,
      avgG: bandG / bandCount,
      avgB: bandB / bandCount,
    });
  }

  // 밴드를 기준으로 섹션 경계 생성
  const sections: SectionBoundary[] = [];
  let sectionStart = 0;

  for (const band of bands) {
    const midY = Math.round((band.startY + band.endY) / 2);

    if (midY - sectionStart >= minSectionHeight) {
      sections.push({
        startY: sectionStart,
        endY: midY,
        height: midY - sectionStart,
        borderColor: rgbToHex(band.avgR, band.avgG, band.avgB),
      });
      sectionStart = midY;
    }
  }

  // 마지막 섹션
  if (height - sectionStart >= minSectionHeight) {
    sections.push({
      startY: sectionStart,
      endY: height,
      height: height - sectionStart,
      borderColor: '#000000',
    });
  }

  // 섹션이 없으면 전체를 1개 섹션으로
  if (sections.length === 0) {
    sections.push({
      startY: 0,
      endY: height,
      height,
      borderColor: '#000000',
    });
  }

  return {
    sourceFile: typeof imageInput === 'string' ? imageInput : 'buffer',
    width,
    height,
    sections,
  };
}

/** 분리된 섹션을 개별 이미지 Buffer로 추출 */
export async function extractSectionImages(
  imageInput: Buffer | string,
  sections: SectionBoundary[],
): Promise<SectionImageResult[]> {
  const metadata = await sharp(imageInput).metadata();
  const width = metadata.width!;

  const results: SectionImageResult[] = [];

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const imageBuffer = await sharp(imageInput)
      .extract({
        left: 0,
        top: sec.startY,
        width,
        height: sec.height,
      })
      .png()
      .toBuffer();

    results.push({
      index: i,
      boundary: sec,
      imageBuffer,
    });
  }

  return results;
}

// ── 유틸 ──

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(c =>
    Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0')
  ).join('');
}
