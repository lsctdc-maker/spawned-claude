import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth-server';

function validateUrl(input: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error('유효하지 않은 URL입니다.');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('http 또는 https URL만 허용됩니다.');
  }
  const hostname = parsed.hostname.toLowerCase();
  const forbidden = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', '[::1]', '::1'];
  if (forbidden.includes(hostname)) {
    throw new Error('허용되지 않는 호스트입니다.');
  }
  if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(hostname)) {
    throw new Error('사설 IP 주소는 허용되지 않습니다.');
  }
  return parsed;
}

const SYSTEM_PROMPT = `다음 상세페이지에서 아래 정보를 추출해주세요:
- productName: 상품명
- category: 카테고리 (food/cosmetics/health/electronics/fashion/living/pets/kids/sports/interior/automotive/stationery/beverages/digital/others 중 하나)
- features: 핵심 특징 (3줄 이내, 문자열)
- price: 가격 정보 (문자열, 예: "29,900원")
- targetCustomer: 추정 타겟 고객
- existingUSPs: 기존 상세페이지에서 강조하는 포인트들 (배열)
- improvementSuggestions: 개선이 필요한 부분들 (배열)
- originalPrice: 정상가 (숫자, 원 단위, 없으면 0)
- salePrice: 할인가 (숫자, 원 단위, 없으면 0)
- discountRate: 할인율 (숫자, %, 없으면 0)
- packageItems: 구성품 목록 (배열, 각 항목은 {name, description})
- freeShipping: 무료배송 여부 (boolean)

반드시 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 반환합니다.
정보가 없는 필드는 빈 문자열, 빈 배열, 또는 0으로 채워주세요.`;

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const { url, imageBase64, mimeType } = body;

    if (!url && !imageBase64) {
      return NextResponse.json({ error: 'URL 또는 이미지가 필요합니다.' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: '분석은 API 키가 필요합니다.' }, { status: 400 });
    }

    let messageContent: unknown;

    if (imageBase64) {
      // 이미지 분석 (Claude Vision)
      messageContent = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType || 'image/jpeg',
            data: imageBase64,
          },
        },
        {
          type: 'text',
          text: '이 상세페이지 스크린샷에서 상품 정보를 추출해주세요.',
        },
      ];
    } else {
      // URL 크롤링 후 텍스트 분석
      let htmlContent = '';
      try {
        const validatedUrl = validateUrl(url);
        const pageResponse = await fetch(validatedUrl.toString(), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        if (!pageResponse.ok) {
          throw new Error(`페이지 로딩 실패: ${pageResponse.status}`);
        }

        htmlContent = await pageResponse.text();
        if (htmlContent.length > 50000) {
          htmlContent = htmlContent.substring(0, 50000);
        }
      } catch {
        return NextResponse.json({ error: '페이지를 불러올 수 없습니다. URL을 확인해주세요.' }, { status: 400 });
      }

      messageContent = `다음 HTML에서 상품 정보를 추출해주세요:\n\n${htmlContent}`;
    }

    // Claude API 호출
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: messageContent,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    const rawText = claudeData.content?.[0]?.text?.trim();

    if (!rawText) {
      throw new Error('분석 결과가 비어있습니다.');
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(rawText);
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('분석 결과를 파싱할 수 없습니다.');
      }
    }

    return NextResponse.json({ success: true, data: analysisResult });
  } catch (error) {
    console.error('Page analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '페이지 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
