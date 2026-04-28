import { NextRequest, NextResponse } from 'next/server';

const SECTION_PROMPTS: Record<string, string> = {
  hooking: '후킹/히어로 섹션: 제품의 핵심 가치를 한 문장으로 강렬하게. 경쟁사 대비 차별점 강조.',
  hero: '히어로 섹션: 제품의 핵심 가치를 한 문장으로 강렬하게. 경쟁사 대비 차별점 강조.',
  problem: '문제 공감 섹션: 타겟 고객이 겪는 3-4가지 고민/불편함. 공감가는 일상 표현 사용.',
  solution: '솔루션 섹션: 이 제품이 어떻게 문제를 해결하는지. 핵심 성분/기술/방식 3가지.',
  features: '특장점 섹션: 제품의 핵심 장점 3-4가지. 각 장점마다 짧은 제목 + 설명.',
  detail: '상세 설명 섹션: 제품의 세부 특징. 수치 데이터(%, 배, 점수) 포함.',
  howto: '사용 방법 섹션: 4단계 사용법. 각 단계 1-2줄로 간결하게.',
  social_proof: '고객 후기 섹션: 실제 사용 후기 3개. 자연스러운 한국어 구어체. 별점 5점 기준.',
  trust: '인증/신뢰 섹션: 제품의 인증, 수상, 검증 내역 5가지.',
  specs: '스펙 섹션: 제품 상세 사양 6-8개 항목 (키:값 형태).',
  guarantee: '보증 섹션: 환불/교환/보증 정책. 고객 안심 포인트 3가지.',
  cta: 'CTA 섹션: 구매 유도 헤드라인 + 혜택 요약.',
  event_banner: '이벤트 섹션: 프로모션/할인 내용.',
};

/**
 * 경쟁사 데이터 기반 섹션별 AI 카피 생성
 *
 * POST /api/ai-copy
 * body: { sectionType, productName, category, usps, competitorContext }
 */
export async function POST(request: NextRequest) {
  try {
    const { sectionType, productName, category, usps, competitorContext } = await request.json();

    const sectionGuide = SECTION_PROMPTS[sectionType] || '이 섹션에 맞는 카피를 작성해주세요.';

    const prompt = `한국 이커머스 상세페이지의 "${sectionType}" 섹션 카피를 작성해주세요.

## 제품 정보
- 제품명: ${productName || '제품'}
- 카테고리: ${category || '일반'}
- USP: ${Array.isArray(usps) ? usps.join(', ') : '없음'}

## 경쟁사 분석 데이터
${competitorContext || '경쟁사 데이터 없음'}

## 섹션 가이드
${sectionGuide}

## 작성 규칙
1. 한국어만 사용 (영문 레이블 금지)
2. 경쟁사 키워드를 참고하되 차별화된 표현 사용
3. 수치 데이터 적극 활용 (%, 배, 만족도 등)
4. 과장 없이 신뢰감 있는 톤
5. AI 생성 느낌(AI slop) 배제: "혁신적인", "완벽한", "시너지" 등 금지

## 응답 형식 (JSON만, 코드블록 없이)
{"title": "섹션 제목", "body": "본문 내용 (줄바꿈은 \\n으로)"}`;

    // Anthropic API 사용
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && apiKey !== 'sk-ant-xxx') {
      try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        const client = new Anthropic({ apiKey });

        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        });

        let text = response.content[0].type === 'text' ? response.content[0].text : '';

        // JSON 추출
        if (text.includes('```json')) text = text.split('```json')[1].split('```')[0];
        else if (text.includes('```')) text = text.split('```')[1].split('```')[0];

        const result = JSON.parse(text.trim());
        return NextResponse.json({ success: true, title: result.title, body: result.body });
      } catch (e) {
        console.error('AI copy generation error:', e);
      }
    }

    // OpenAI 폴백
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1024,
            temperature: 0.7,
          }),
        });
        const data = await res.json();
        let text = data.choices?.[0]?.message?.content || '';
        if (text.includes('```json')) text = text.split('```json')[1].split('```')[0];
        else if (text.includes('```')) text = text.split('```')[1].split('```')[0];
        const result = JSON.parse(text.trim());
        return NextResponse.json({ success: true, title: result.title, body: result.body });
      } catch (e) {
        console.error('OpenAI copy error:', e);
      }
    }

    // 최종 폴백: 기본 텍스트
    return NextResponse.json({
      success: true,
      title: `${productName || '제품'} - ${sectionGuide.split(':')[0]}`,
      body: `${productName || '제품'}의 ${sectionType} 섹션 내용을 입력해주세요.`,
    });
  } catch (e) {
    console.error('AI copy error:', e);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
