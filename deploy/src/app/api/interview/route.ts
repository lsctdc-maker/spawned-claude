import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth-server';
import { INTERVIEW_QUESTIONS, DEFAULT_INTERVIEW_QUESTIONS } from '@/lib/constants';
import { CategoryKey } from '@/lib/types';

const FIRST_QUESTIONS: Record<CategoryKey, string> = {
  food: '먼저 이 식품의 가장 자랑하고 싶은 점이 뭔가요? 원재료의 품질이든, 맛이든, 건강 효과든 — 고객에게 딱 한 가지만 말할 수 있다면 뭘 말하고 싶으세요?',
  cosmetics: '이 화장품을 써본 사람들이 가장 먼저 느끼는 변화가 뭔가요? 사용감, 효과, 향 — 어떤 순간에 \'이거다!\' 하는 포인트가 있다면 알려주세요.',
  health: '이 건강기능식품을 찾는 분들이 가장 고민하는 건강 이슈가 뭔가요? 그리고 이 제품이 그 고민을 어떻게 해결해주는지 편하게 설명해주세요.',
  electronics: '이 제품의 핵심 기능 하나만 꼽는다면? 기존에 쓰던 제품 대비 \'이것만큼은 확실히 다르다\'는 포인트를 알려주세요.',
  fashion: '이 제품의 디자인이나 핏에서 가장 자신 있는 부분이 뭔가요? 착용했을 때 어떤 느낌을 주고 싶은지도 알려주시면 좋아요.',
  living: '이 생활용품이 해결해주는 일상의 불편함이 뭔가요? \'아, 이런 게 있었으면 좋겠다\' 하고 생각하던 그 순간을 알려주세요.',
  pets: '반려동물 제품이시군요! 어떤 동물, 어떤 연령/크기에 맞는 제품인가요? 그리고 기존 제품 대비 반려인들이 가장 만족하는 포인트가 뭔가요?',
  kids: '유아/아동 제품에서 부모님들이 가장 신경 쓰는 건 안전성이죠. 안전 인증이나 소재 면에서 자신 있는 부분이 있나요?',
  sports: '이 스포츠 용품을 쓰면 퍼포먼스가 어떻게 달라지나요? 초보자용인지 전문가용인지, 어떤 운동에 특화되어 있는지 알려주세요.',
  interior: '이 인테리어 제품이 공간에 어떤 분위기를 만들어주나요? 어떤 스타일의 집에 잘 어울리는지, 크기나 소재 특징도 알려주세요.',
  automotive: '이 자동차용품이 해결해주는 운전 중 불편함이 뭔가요? 차종에 상관없이 호환되는지, 설치가 쉬운지도 중요할 것 같아요.',
  stationery: '이 문구/오피스 제품만의 디자인이나 기능적 차별점이 뭔가요? 일상에서 쓸 때 \'이건 다르다\' 느끼는 순간이 있다면 알려주세요.',
  beverages: '이 음료/주류의 맛이나 향에서 가장 특별한 점이 뭔가요? 어떤 상황에서 마시면 가장 잘 어울리는지도 궁금해요.',
  digital: '이 디지털 제품/소프트웨어가 해결해주는 핵심 문제가 뭔가요? 기존 솔루션 대비 가장 큰 장점을 알려주세요.',
  others: '이 제품의 가장 큰 매력 포인트가 뭔가요? 고객이 \'이건 사야 해\' 하고 느낄 만한 핵심 가치를 알려주세요.',
};

const MIN_QUESTIONS = 5;

const SYSTEM_PROMPT = `당신은 한국 이커머스 상세페이지 전문 기획자입니다.
셀러와 인터뷰를 통해 상품의 핵심 셀링포인트를 뽑아내는 것이 목표입니다.

[중요] 절대 금지 사항:
- 셀러가 이미 입력한 정보(제품명, 카테고리, 간단 설명, 특장점, 가격대, 타겟 고객, 키워드)는 절대 다시 질문하지 마세요.
- "제품을 간단히 소개해주세요", "어떤 제품인가요?", "가격이 얼마인가요?", "타겟 고객은 누구인가요?" 같은 질문은 하지 마세요.
- 이미 알고 있는 정보를 확인하거나 반복하는 질문은 절대 하지 마세요.
- 셀러가 제공한 정보를 그대로 되묻는 질문은 하지 마세요.

규칙:
1. 이미 제공된 정보를 바탕으로 더 깊은 인사이트를 얻기 위한 질문만 하세요.
   예: 가격이 이미 제공됨 → "가격이 얼마예요?" ❌ → "이 가격대에서 경쟁 제품 대비 가성비를 어떻게 어필할 건가요?" ✅
   예: 간단 설명이 이미 제공됨 → "제품 설명해주세요" ❌ → "그 기능에서 경쟁사와 다른 기술적 차별점이 있나요?" ✅
2. 질문은 구체적이고 친근하게. 단답형이 나오지 않도록 예시 포함
3. 셀러가 못 생각한 셀링포인트를 이끌어내기
4. 왜 이 정보가 중요한지 간단히 설명 포함
5. 최소 ${MIN_QUESTIONS}개 이상 질문. 정보가 충분히 수집되었다고 판단되면 isComplete: true로 종료
6. 한국어로 질문

추가 수집 목표 (이미 제공되지 않은 경우에만):
- 구성품/세트 내용 (단품인지, 세트인지, 뭐가 포함되는지)
- 배송 관련 정보 (무료배송 여부, 배송 기간)
- 실제 사용 후기나 고객 반응
- 경쟁 제품 대비 차별점
- 고객이 이 제품 없이 겪는 가장 큰 불편함 (문제 공감 섹션용)
- 경쟁 제품 대비 약점이나 부족한 부분 (포지셔닝 재프레이밍용 — 약점을 강점으로 재해석할 수 있도록)
- 고객 리뷰나 피드백 현황; 없다면 전문가 추천이나 인증 여부 (사회적 증거용)
- 교환/환불/배송 정책 (보증 섹션용)
- 가격/할인 정보: 상세페이지에 가격이나 할인 정보를 포함할지 물어보세요. 포함한다고 하면 두 가지 옵션을 제시하세요: (1) 상세페이지 본문에 직접 가격 정보를 넣는 방법 — 가격이 바뀌면 본문도 수정해야 하지만 구매 전환에 직접적으로 작용함, (2) 별도 이벤트 배너로 제작하는 방법 — 시즌/프로모션마다 배너만 교체하면 되어 유지 관리가 쉬움. 사용자가 선택한 방식에 따라 정가, 할인가, 이벤트 문구를 수집하세요. 포함하지 않겠다고 하면 가격 관련 내용은 수집하지 마세요.

응답 형식:
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 반환합니다.

충분한 정보가 수집되었다고 판단되면:
{"question": "마지막 확인 질문...", "isComplete": true}

아직 더 물어볼 것이 있으면:
{"question": "다음 질문...", "isComplete": false}

예시:
나쁜: "이 제품을 간단히 소개해주세요" (이미 제공된 정보 재요청)
나쁜: "타겟 고객이 누구인가요?" (이미 제공된 정보 재요청)
좋은: "제주 녹차 아이스크림이시군요! 혹시 녹차 원료의 산지나 등급이 특별한 점이 있나요? '오설록 유기농 1등급 말차 사용' 같은 구체적인 정보가 있으면 고객 신뢰도가 확 올라갑니다."
좋은: "구성품이 어떻게 되나요? 박스에 뭐가 같이 들어있는지, 언박싱 경험도 요즘 중요한 셀링포인트거든요."`;

interface PreviousAnswer {
  question: string;
  answer: string;
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const { category, productName, shortDescription, price, targetAudience, keywords, previousAnswers, productPhotoBase64, productPhotoMimeType } = body as {
      category: CategoryKey;
      productName?: string;
      shortDescription?: string;
      price?: string;
      targetAudience?: string;
      keywords?: string;
      previousAnswers?: PreviousAnswer[];
      productPhotoBase64?: string;
      productPhotoMimeType?: string;
    };

    const questionIndex = previousAnswers?.length || 0;

    // 첫 번째 질문: 카테고리별 고정 첫 질문 반환
    if (questionIndex === 0) {
      const firstQuestion = category && FIRST_QUESTIONS[category]
        ? FIRST_QUESTIONS[category]
        : '이 제품을 한 문장으로 소개한다면 어떻게 말씀하시겠어요? 고객이 딱 보고 "이거다!" 할 수 있는 핵심 포인트를 알려주세요.';

      return NextResponse.json({ question: firstQuestion, questionIndex: 0, isComplete: false });
    }

    // 이후 질문: Claude API로 동적 생성
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      const fallbackQuestions = category && INTERVIEW_QUESTIONS[category]
        ? INTERVIEW_QUESTIONS[category]
        : DEFAULT_INTERVIEW_QUESTIONS;

      if (questionIndex < fallbackQuestions.length) {
        return NextResponse.json({
          question: fallbackQuestions[questionIndex].question,
          questionIndex,
          isComplete: questionIndex >= fallbackQuestions.length - 1,
        });
      }

      return NextResponse.json({ question: null, questionIndex, done: true, isComplete: true });
    }

    // 대화 히스토리 구성
    const conversationHistory: { role: 'user' | 'assistant'; content: unknown }[] = [];

    // 첫 번째 동적 질문 호출 시 제품 사진을 Vision으로 포함 (한 번만)
    if (questionIndex === 1 && productPhotoBase64) {
      conversationHistory.push({
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: productPhotoMimeType || 'image/jpeg',
              data: productPhotoBase64,
            },
          },
          {
            type: 'text',
            text: `제품 사진입니다. 이 제품(${productName || '상품'})에 대한 인터뷰를 진행합니다.`,
          },
        ],
      });
      conversationHistory.push({
        role: 'assistant',
        content: '제품 사진 확인했습니다. 인터뷰를 시작하겠습니다.',
      });
    }

    // 이전 답변 대화 추가
    if (previousAnswers) {
      for (const pa of previousAnswers) {
        conversationHistory.push({ role: 'assistant', content: pa.question });
        conversationHistory.push({ role: 'user', content: pa.answer });
      }
    }

    const collectedInfo = previousAnswers?.map((pa) => `Q: ${pa.question}\nA: ${pa.answer}`).join('\n\n') || '';

    const sellerContext = `=== 셀러가 이미 제공한 정보 (절대 다시 묻지 마세요) ===\n카테고리: ${category || '일반'}\n상품명: ${productName || '미정'}${shortDescription ? `\n간단 설명: ${shortDescription}` : ''}${price ? `\n가격대: ${price}` : ''}${targetAudience ? `\n타겟 고객: ${targetAudience}` : ''}${keywords ? `\n주요 키워드/특장점: ${keywords}` : ''}\n\n현재 ${questionIndex + 1}번째 질문을 생성해야 합니다. (최소 ${MIN_QUESTIONS}개)\n\n인터뷰에서 추가로 수집된 정보:\n${collectedInfo || '(아직 없음)'}\n\n반드시 JSON 형식으로만 응답하세요: {"question": "...", "isComplete": true/false}`;

    // Prepend seller context as first user message (not in system prompt)
    const messagesWithContext: { role: 'user' | 'assistant'; content: unknown }[] = [
      { role: 'user', content: sellerContext },
      { role: 'assistant', content: '네, 셀러 정보를 확인했습니다. 이 정보를 바탕으로 인터뷰를 진행하겠습니다.' },
      ...conversationHistory,
    ];

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: messagesWithContext,
      }),
    });

    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    const rawText = claudeData.content?.[0]?.text?.trim();

    if (!rawText) {
      throw new Error('Empty response from Claude API');
    }

    let question: string;
    let isComplete = false;

    try {
      const parsed = JSON.parse(rawText);
      question = parsed.question;
      isComplete = parsed.isComplete === true;
    } catch {
      question = rawText;
      isComplete = false;
    }

    // 최소 질문 수 미만이면 isComplete 강제 false
    if (questionIndex < MIN_QUESTIONS - 1) {
      isComplete = false;
    }

    if (!question) {
      return NextResponse.json({ question: null, questionIndex, done: true, isComplete: true });
    }

    return NextResponse.json({ question, questionIndex, isComplete });
  } catch (error) {
    console.error('Interview API error:', error);

    try {
      const body = await request.clone().json().catch(() => ({}));
      const { category, previousAnswers } = body as {
        category?: CategoryKey;
        previousAnswers?: PreviousAnswer[];
      };
      const questionIndex = previousAnswers?.length || 0;
      const fallbackQuestions = category && INTERVIEW_QUESTIONS[category]
        ? INTERVIEW_QUESTIONS[category]
        : DEFAULT_INTERVIEW_QUESTIONS;

      if (questionIndex < fallbackQuestions.length) {
        return NextResponse.json({
          question: fallbackQuestions[questionIndex].question,
          questionIndex,
          isComplete: questionIndex >= fallbackQuestions.length - 1,
        });
      }
    } catch {
      // ignore
    }

    return NextResponse.json(
      { error: '인터뷰 질문을 불러오는데 실패했습니다.', question: null, isComplete: true },
      { status: 200 }
    );
  }
}
