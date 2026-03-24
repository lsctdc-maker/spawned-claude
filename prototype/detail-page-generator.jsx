import { useState, useRef, useCallback } from "react";

// ─── 카테고리별 색상 팔레트 ───
const CATEGORY_PALETTES = {
  식품: { primary: "#E85D2A", secondary: "#FFF3ED", accent: "#C44D1F", text: "#4A2410", badge: "#FFECD6" },
  화장품: { primary: "#C75B9B", secondary: "#FDF2F8", accent: "#A14580", text: "#4A1942", badge: "#F9E0F0" },
  건기식: { primary: "#2D9F5D", secondary: "#EDFFF4", accent: "#1F7A45", text: "#0F3D22", badge: "#D4F5E2" },
  가전: { primary: "#2563EB", secondary: "#EFF6FF", accent: "#1D4ED8", text: "#1E2A4A", badge: "#DBEAFE" },
  패션: { primary: "#1A1A1A", secondary: "#F9F9F9", accent: "#333333", text: "#111111", badge: "#E8E8E8" },
  생활용품: { primary: "#7C3AED", secondary: "#F5F3FF", accent: "#6D28D9", text: "#2E1065", badge: "#EDE9FE" },
};

// ─── USP 추출 템플릿 ───
const USP_TEMPLATES = {
  식품: [
    (p) => `${p.name}만의 프리미엄 원재료로 깊은 풍미를 완성`,
    (p) => `HACCP 인증 시설에서 엄격한 품질관리로 생산`,
    (p) => `${p.target}이 선택한 건강한 맛의 비결`,
    (p) => `간편하게 즐기는 레스토랑급 퀄리티`,
    (p) => `합성첨가물 ZERO, 자연 그대로의 맛`,
  ],
  화장품: [
    (p) => `피부과 전문의가 인정한 ${p.name}의 핵심 성분`,
    (p) => `민감성 피부도 안심, 저자극 포뮬러 설계`,
    (p) => `사용 4주 만에 체감하는 확실한 변화`,
    (p) => `${p.target}의 피부 고민을 정조준한 맞춤 솔루션`,
    (p) => `글로벌 트렌드를 반영한 K-뷰티 기술력`,
  ],
  건기식: [
    (p) => `식약처 인증 기능성 원료 ${p.name} 핵심 성분`,
    (p) => `체내 흡수율을 극대화한 특허 기술 적용`,
    (p) => `${p.target}의 건강 루틴에 최적화된 설계`,
    (p) => `하루 1포로 간편하게 관리하는 건강 습관`,
    (p) => `GMP 인증 시설에서 생산한 프리미엄 품질`,
  ],
  가전: [
    (p) => `${p.name}만의 독자적 스마트 기술 탑재`,
    (p) => `에너지 효율 1등급, 전기료 걱정 끝`,
    (p) => `${p.target}의 라이프스타일에 맞춘 스마트 설계`,
    (p) => `소음 최소화 기술로 조용한 일상 보장`,
    (p) => `직관적 UI로 누구나 쉬운 사용 경험`,
  ],
  패션: [
    (p) => `트렌드와 실용성을 동시에 잡은 ${p.name} 디자인`,
    (p) => `프리미엄 원단으로 완성한 차별화된 착용감`,
    (p) => `${p.target}의 스타일을 한 단계 업그레이드`,
    (p) => `시즌 내내 활용 가능한 다재다능한 아이템`,
    (p) => `까다로운 핏 테스트를 통과한 완벽 실루엣`,
  ],
  생활용품: [
    (p) => `일상의 불편함을 해결하는 ${p.name}의 스마트 설계`,
    (p) => `친환경 소재 사용으로 지구도 함께 생각`,
    (p) => `${p.target}이 만족한 실사용 후기 폭발`,
    (p) => `공간 효율을 극대화하는 미니멀 디자인`,
    (p) => `국내 최고 품질 기준을 충족하는 안전성`,
  ],
};

// ─── 헤드라인 템플릿 ───
const HEADLINE_TEMPLATES = [
  (p) => [`${p.target}이 열광하는\n${p.name}의 비밀`, `지금까지 이런 ${p.category}은 없었다`],
  (p) => [`당신의 일상을 바꿀\n단 하나의 선택, ${p.name}`, `${p.target}을 위해 완성한 프리미엄 ${p.category}`],
  (p) => [`${p.name}\n차원이 다른 경험의 시작`, `${p.features.split("\n")[0]?.trim() || "완벽한 품질"}을 직접 확인하세요`],
  (p) => [`아직도 고민 중이세요?\n${p.name}이면 충분합니다`, `${p.target} 사이에서 입소문난 그 제품`],
];

// ─── 사용법 템플릿 ───
const HOWTO_TEMPLATES = {
  식품: ["1. 포장을 개봉하고 내용물을 확인합니다", "2. 기호에 맞게 조리하거나 바로 섭취합니다", "3. 남은 제품은 밀봉하여 냉장 보관합니다"],
  화장품: ["1. 세안 후 물기를 제거합니다", "2. 적당량을 덜어 얼굴에 골고루 펴 바릅니다", "3. 가볍게 두드리며 흡수시킵니다"],
  건기식: ["1. 하루 권장 섭취량을 확인합니다", "2. 물과 함께 식후에 섭취합니다", "3. 꾸준히 섭취하여 건강을 관리합니다"],
  가전: ["1. 제품을 원하는 위치에 설치합니다", "2. 전원을 연결하고 초기 설정을 완료합니다", "3. 사용 설명서에 따라 원하는 기능을 선택합니다"],
  패션: ["1. 사이즈 차트를 참고하여 맞는 사이즈를 선택합니다", "2. 처음 착용 전 세탁 라벨을 확인합니다", "3. 스타일에 맞게 다양한 코디에 활용합니다"],
  생활용품: ["1. 패키지에서 제품을 꺼내 구성품을 확인합니다", "2. 사용 설명서에 따라 조립 또는 설치합니다", "3. 용도에 맞게 활용하며 주기적으로 관리합니다"],
};

// ─── FAQ 템플릿 ───
const FAQ_TEMPLATES = {
  식품: [
    { q: "유통기한은 얼마나 되나요?", a: "제조일로부터 상온 보관 시 12개월, 개봉 후에는 냉장 보관하여 빠르게 소비해 주세요." },
    { q: "알레르기 성분이 포함되어 있나요?", a: "제품 라벨의 알레르기 유발 물질 표시를 반드시 확인해 주세요. 상세 성분은 제품 상세 정보에서 확인 가능합니다." },
    { q: "배송은 어떻게 되나요?", a: "신선도 유지를 위해 냉장/냉동 특수 포장으로 발송되며, 주문 후 1~2일 내 출고됩니다." },
  ],
  화장품: [
    { q: "민감성 피부에도 사용할 수 있나요?", a: "네, 저자극 테스트를 완료한 제품으로 민감성 피부에도 안심하고 사용하실 수 있습니다." },
    { q: "개봉 후 사용 기한은 얼마인가요?", a: "개봉 후 12개월 이내 사용을 권장하며, 직사광선을 피해 서늘한 곳에 보관해 주세요." },
    { q: "다른 화장품과 함께 사용해도 되나요?", a: "기본 스킨케어 루틴에 자연스럽게 더해 사용하실 수 있습니다. 자극이 느껴지면 사용을 중단해 주세요." },
  ],
  건기식: [
    { q: "하루 권장 섭취량은 얼마인가요?", a: "1일 1회, 1포를 물과 함께 섭취하시면 됩니다. 과다 섭취는 삼가해 주세요." },
    { q: "임산부도 섭취할 수 있나요?", a: "임산부, 수유부 및 어린이는 섭취 전 반드시 전문의와 상담 후 섭취해 주세요." },
    { q: "효과는 언제부터 느낄 수 있나요?", a: "개인차가 있으나, 꾸준히 4~8주 섭취 시 변화를 체감하실 수 있습니다." },
  ],
  가전: [
    { q: "설치 서비스가 제공되나요?", a: "전문 기사 방문 설치 서비스가 무료로 제공됩니다. 배송 시 설치 일정을 안내드립니다." },
    { q: "A/S 기간은 얼마나 되나요?", a: "구매일로부터 1년간 무상 A/S가 제공되며, 이후에도 유상 수리가 가능합니다." },
    { q: "소비 전력은 어떻게 되나요?", a: "에너지 효율 1등급 제품으로, 월 전기료 부담을 최소화하였습니다." },
  ],
  패션: [
    { q: "사이즈 교환이 가능한가요?", a: "상품 수령 후 7일 이내, 택 미제거 상태에서 무료 교환이 가능합니다." },
    { q: "세탁 방법은 어떻게 되나요?", a: "제품 내 세탁 라벨을 확인해 주세요. 대부분 중성세제로 손세탁을 권장합니다." },
    { q: "실제 색상과 차이가 있을 수 있나요?", a: "모니터 환경에 따라 약간의 색상 차이가 있을 수 있으나, 실물과 최대한 동일하게 촬영하였습니다." },
  ],
  생활용품: [
    { q: "조립이 필요한가요?", a: "간단한 조립이 필요하며, 상세한 조립 설명서가 동봉되어 있습니다." },
    { q: "반품/교환 절차는 어떻게 되나요?", a: "수령 후 7일 이내 고객센터를 통해 반품/교환 접수가 가능합니다." },
    { q: "AS 문의는 어디로 하나요?", a: "고객센터(1588-XXXX) 또는 카카오톡 채널을 통해 A/S 문의 가능합니다." },
  ],
};

// ─── 아이콘 SVG ───
const ICONS = {
  star: (color) => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  shield: (color) => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  heart: (color) => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  check: (color) => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  zap: (color) => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill={color} stroke="none">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
};
const ICON_KEYS = Object.keys(ICONS);

// ─── 유틸 ───
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function shuffleSlice(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
function formatPrice(price) {
  if (!price) return "";
  return Number(price.replace(/[^0-9]/g, "")).toLocaleString("ko-KR") + "원";
}

// ─── 메인 앱 ───
export default function DetailPageGenerator() {
  const [form, setForm] = useState({
    name: "",
    category: "식품",
    features: "",
    target: "",
    price: "",
  });
  const [generated, setGenerated] = useState(null);
  const [tab, setTab] = useState("input"); // input | preview
  const previewRef = useRef(null);

  const palette = CATEGORY_PALETTES[form.category];

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // ── USP 추출 & 카피 생성 ──
  const generate = useCallback(() => {
    const cat = form.category;
    const p = { ...form };

    // USP 추출 (3~5개)
    const uspCount = 3 + Math.floor(Math.random() * 3); // 3~5
    const uspTemplates = USP_TEMPLATES[cat] || USP_TEMPLATES["생활용품"];
    const usps = shuffleSlice(uspTemplates, Math.min(uspCount, uspTemplates.length)).map((fn) => fn(p));

    // 헤드라인
    const [headline, subheadline] = pickRandom(HEADLINE_TEMPLATES)(p);

    // 상세 설명
    const detailDesc = `${p.name}은(는) ${p.target}을(를) 위해 탄생한 프리미엄 ${cat} 제품입니다. ${p.features.split("\n").filter(Boolean).join(", ")} 등의 특징을 갖추고 있으며, 고객 만족을 최우선으로 설계되었습니다. 까다로운 품질 기준을 통과한 ${p.name}으로 한 차원 높은 경험을 시작하세요.`;

    // 사용법
    const howto = HOWTO_TEMPLATES[cat] || HOWTO_TEMPLATES["생활용품"];

    // FAQ
    const faqs = FAQ_TEMPLATES[cat] || FAQ_TEMPLATES["생활용품"];

    // CTA
    const ctaTexts = [
      `지금 ${p.name}을(를) 만나보세요!`,
      `${p.target}을 위한 특별한 선택`,
      `한정 수량 특가! 놓치지 마세요`,
    ];

    const pal = CATEGORY_PALETTES[cat];

    setGenerated({
      headline,
      subheadline,
      usps,
      detailDesc,
      howto,
      faqs,
      cta: pickRandom(ctaTexts),
      palette: pal,
      product: p,
    });
    setTab("preview");
  }, [form]);

  // ── HTML 다운로드 ──
  const downloadHTML = useCallback(() => {
    if (!generated) return;
    const g = generated;
    const pal = g.palette;

    const uspHTML = g.usps
      .map(
        (u, i) => `
      <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:24px;">
        <div style="min-width:48px;height:48px;border-radius:50%;background:${pal.badge};display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:${pal.primary};">${i + 1}</div>
        <div style="flex:1;">
          <p style="margin:0;font-size:17px;line-height:1.7;color:#333;">${u}</p>
        </div>
      </div>`
      )
      .join("\n");

    const howtoHTML = g.howto
      .map(
        (h) => `<li style="margin-bottom:12px;font-size:16px;line-height:1.7;color:#444;">${h}</li>`
      )
      .join("\n");

    const faqHTML = g.faqs
      .map(
        (f) => `
      <div style="margin-bottom:20px;padding:20px;background:#f9f9f9;border-radius:12px;">
        <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#222;">Q. ${f.q}</p>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#555;">A. ${f.a}</p>
      </div>`
      )
      .join("\n");

    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${g.product.name} - 상세페이지</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; }
  .container { max-width: 860px; margin: 0 auto; background: #fff; }
</style>
</head>
<body>
<div class="container">
  <!-- 히어로 -->
  <div style="background:linear-gradient(135deg, ${pal.primary}, ${pal.accent});padding:80px 40px;text-align:center;">
    <h1 style="font-size:36px;font-weight:800;color:#fff;line-height:1.4;white-space:pre-line;margin-bottom:20px;">${g.headline}</h1>
    <p style="font-size:18px;color:rgba(255,255,255,0.9);line-height:1.6;">${g.subheadline}</p>
    ${g.product.price ? `<div style="margin-top:30px;display:inline-block;background:rgba(255,255,255,0.2);padding:12px 32px;border-radius:50px;"><span style="font-size:28px;font-weight:800;color:#fff;">${formatPrice(g.product.price)}</span></div>` : ""}
  </div>

  <!-- USP 포인트 -->
  <div style="padding:60px 40px;">
    <h2 style="font-size:26px;font-weight:800;color:#222;text-align:center;margin-bottom:40px;">
      <span style="color:${pal.primary};">${g.product.name}</span>을 선택해야 하는 이유
    </h2>
    ${uspHTML}
  </div>

  <!-- 구분선 -->
  <div style="height:12px;background:${pal.secondary};"></div>

  <!-- 상세 설명 -->
  <div style="padding:60px 40px;">
    <h2 style="font-size:24px;font-weight:800;color:#222;text-align:center;margin-bottom:30px;">제품 상세 정보</h2>
    <p style="font-size:16px;line-height:2;color:#444;text-align:center;max-width:700px;margin:0 auto;">${g.detailDesc}</p>
  </div>

  <!-- 구분선 -->
  <div style="height:12px;background:${pal.secondary};"></div>

  <!-- 사용법 -->
  <div style="padding:60px 40px;">
    <h2 style="font-size:24px;font-weight:800;color:#222;text-align:center;margin-bottom:30px;">HOW TO USE</h2>
    <ol style="max-width:600px;margin:0 auto;padding-left:20px;">
      ${howtoHTML}
    </ol>
  </div>

  <!-- 구분선 -->
  <div style="height:12px;background:${pal.secondary};"></div>

  <!-- FAQ -->
  <div style="padding:60px 40px;">
    <h2 style="font-size:24px;font-weight:800;color:#222;text-align:center;margin-bottom:30px;">자주 묻는 질문</h2>
    ${faqHTML}
  </div>

  <!-- CTA -->
  <div style="padding:60px 40px;text-align:center;background:${pal.secondary};">
    <p style="font-size:24px;font-weight:800;color:${pal.text};margin-bottom:24px;">${g.cta}</p>
    <a href="#" style="display:inline-block;padding:18px 60px;background:${pal.primary};color:#fff;font-size:18px;font-weight:700;border-radius:50px;text-decoration:none;">지금 구매하기</a>
    <p style="margin-top:16px;font-size:14px;color:#888;">무료배송 | 100% 정품 보장 | 간편 반품</p>
  </div>
</div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${g.product.name}_상세페이지.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generated]);

  // ── 입력 폼 UI ──
  const renderInputForm = () => (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111", marginBottom: 8 }}>
          상세페이지 카피 자동 생성기
        </h1>
        <p style={{ fontSize: 15, color: "#888" }}>
          상품 정보를 입력하면 한국형 상세페이지 카피를 자동으로 생성합니다
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* 상품명 */}
        <div>
          <label style={labelStyle}>상품명 *</label>
          <input
            type="text"
            value={form.name}
            onChange={handleChange("name")}
            placeholder="예: 제주 감귤 콜라겐 젤리"
            style={inputStyle}
          />
        </div>

        {/* 카테고리 */}
        <div>
          <label style={labelStyle}>카테고리 *</label>
          <select value={form.category} onChange={handleChange("category")} style={inputStyle}>
            {Object.keys(CATEGORY_PALETTES).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* 핵심 특징 */}
        <div>
          <label style={labelStyle}>핵심 특징 *</label>
          <textarea
            value={form.features}
            onChange={handleChange("features")}
            placeholder={"예:\n100% 제주산 감귤 추출물 사용\n저분자 콜라겐 1000mg 함유\n설탕 무첨가, 칼로리 부담 없음"}
            rows={4}
            style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
          />
          <p style={{ fontSize: 13, color: "#aaa", marginTop: 6 }}>한 줄에 하나씩 입력해 주세요</p>
        </div>

        {/* 타겟 고객 */}
        <div>
          <label style={labelStyle}>타겟 고객 *</label>
          <input
            type="text"
            value={form.target}
            onChange={handleChange("target")}
            placeholder="예: 20~30대 건강 관리에 관심 있는 여성"
            style={inputStyle}
          />
        </div>

        {/* 가격대 */}
        <div>
          <label style={labelStyle}>가격대</label>
          <input
            type="text"
            value={form.price}
            onChange={handleChange("price")}
            placeholder="예: 29800"
            style={inputStyle}
          />
        </div>

        {/* 카테고리 프리뷰 */}
        <div style={{
          padding: 16,
          borderRadius: 12,
          background: palette.secondary,
          border: `1px solid ${palette.badge}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: palette.primary,
          }} />
          <div>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 2 }}>선택된 카테고리 팔레트</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: palette.text }}>{form.category}</p>
          </div>
        </div>

        {/* 생성 버튼 */}
        <button
          onClick={generate}
          disabled={!form.name || !form.features || !form.target}
          style={{
            padding: "16px 0",
            fontSize: 17,
            fontWeight: 700,
            color: "#fff",
            background: !form.name || !form.features || !form.target ? "#ccc" : palette.primary,
            border: "none",
            borderRadius: 12,
            cursor: !form.name || !form.features || !form.target ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          카피 자동 생성하기
        </button>
      </div>
    </div>
  );

  // ── 미리보기 UI ──
  const renderPreview = () => {
    if (!generated) return null;
    const g = generated;
    const pal = g.palette;

    return (
      <div style={{ padding: "20px 0" }}>
        {/* 액션 바 */}
        <div style={{
          maxWidth: 860,
          margin: "0 auto 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px",
        }}>
          <button
            onClick={() => setTab("input")}
            style={{
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              color: "#666",
              background: "#f0f0f0",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            ← 다시 입력
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={generate}
              style={{
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 600,
                color: pal.primary,
                background: pal.badge,
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              다시 생성
            </button>
            <button
              onClick={downloadHTML}
              style={{
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                background: pal.primary,
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              HTML 다운로드
            </button>
          </div>
        </div>

        {/* 상세페이지 프리뷰 (860px) */}
        <div
          ref={previewRef}
          style={{
            maxWidth: 860,
            margin: "0 auto",
            background: "#fff",
            boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {/* 히어로 */}
          <div
            style={{
              background: `linear-gradient(135deg, ${pal.primary}, ${pal.accent})`,
              padding: "80px 40px",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.4,
                whiteSpace: "pre-line",
                marginBottom: 20,
              }}
            >
              {g.headline}
            </h1>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.9)", lineHeight: 1.6 }}>
              {g.subheadline}
            </p>
            {g.product.price && (
              <div
                style={{
                  marginTop: 30,
                  display: "inline-block",
                  background: "rgba(255,255,255,0.2)",
                  padding: "12px 32px",
                  borderRadius: 50,
                }}
              >
                <span style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>
                  {formatPrice(g.product.price)}
                </span>
              </div>
            )}
          </div>

          {/* USP 섹션 */}
          <div style={{ padding: "60px 40px" }}>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#222",
                textAlign: "center",
                marginBottom: 40,
              }}
            >
              <span style={{ color: pal.primary }}>{g.product.name}</span>을 선택해야 하는 이유
            </h2>
            {g.usps.map((usp, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  marginBottom: 28,
                  padding: 20,
                  background: pal.secondary,
                  borderRadius: 16,
                }}
              >
                <div
                  style={{
                    minWidth: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: pal.badge,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {ICONS[ICON_KEYS[i % ICON_KEYS.length]](pal.primary)}
                </div>
                <div style={{ flex: 1, paddingTop: 8 }}>
                  <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: "#333", fontWeight: 600 }}>
                    {usp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 구분선 */}
          <div style={{ height: 12, background: pal.secondary }} />

          {/* 제품 상세 */}
          <div style={{ padding: "60px 40px" }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#222",
                textAlign: "center",
                marginBottom: 30,
              }}
            >
              제품 상세 정보
            </h2>
            <p
              style={{
                fontSize: 16,
                lineHeight: 2,
                color: "#444",
                textAlign: "center",
                maxWidth: 700,
                margin: "0 auto",
              }}
            >
              {g.detailDesc}
            </p>
          </div>

          {/* 구분선 */}
          <div style={{ height: 12, background: pal.secondary }} />

          {/* 사용법 */}
          <div style={{ padding: "60px 40px" }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#222",
                textAlign: "center",
                marginBottom: 30,
              }}
            >
              HOW TO USE
            </h2>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
              {g.howto.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      minWidth: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: pal.primary,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      paddingTop: 6,
                      fontSize: 16,
                      lineHeight: 1.7,
                      color: "#444",
                    }}
                  >
                    {step.replace(/^\d+\.\s*/, "")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ height: 12, background: pal.secondary }} />

          {/* FAQ */}
          <div style={{ padding: "60px 40px" }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#222",
                textAlign: "center",
                marginBottom: 30,
              }}
            >
              자주 묻는 질문
            </h2>
            {g.faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 20,
                  padding: 24,
                  background: "#f9f9f9",
                  borderRadius: 12,
                }}
              >
                <p style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: "#222" }}>
                  Q. {faq.q}
                </p>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "#555" }}>
                  A. {faq.a}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            style={{
              padding: "60px 40px",
              textAlign: "center",
              background: pal.secondary,
            }}
          >
            <p
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: pal.text,
                marginBottom: 24,
              }}
            >
              {g.cta}
            </p>
            <button
              style={{
                padding: "18px 60px",
                background: pal.primary,
                color: "#fff",
                fontSize: 18,
                fontWeight: 700,
                border: "none",
                borderRadius: 50,
                cursor: "pointer",
                boxShadow: `0 4px 20px ${pal.primary}44`,
              }}
            >
              지금 구매하기
            </button>
            <p style={{ marginTop: 16, fontSize: 14, color: "#888" }}>
              무료배송 | 100% 정품 보장 | 간편 반품
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* 탑 네비게이션 */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #eee",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${palette.primary}, ${palette.accent})`,
          }}
        />
        <span style={{ fontSize: 16, fontWeight: 700, color: "#222" }}>
          상세페이지 카피 생성기
        </span>
        <span style={{ fontSize: 12, color: "#aaa", marginLeft: 4 }}>PROTOTYPE</span>
      </div>

      {/* 탭 네비게이션 */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {[
          { id: "input", label: "상품 정보 입력" },
          { id: "preview", label: "미리보기" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            disabled={t.id === "preview" && !generated}
            style={{
              padding: "14px 32px",
              fontSize: 14,
              fontWeight: 600,
              color: tab === t.id ? palette.primary : "#888",
              background: "none",
              border: "none",
              borderBottom: tab === t.id ? `2px solid ${palette.primary}` : "2px solid transparent",
              cursor: t.id === "preview" && !generated ? "not-allowed" : "pointer",
              opacity: t.id === "preview" && !generated ? 0.4 : 1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 컨텐츠 */}
      {tab === "input" && renderInputForm()}
      {tab === "preview" && renderPreview()}
    </div>
  );
}

// ── 공통 스타일 ──
const labelStyle = {
  display: "block",
  fontSize: 14,
  fontWeight: 600,
  color: "#333",
  marginBottom: 8,
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  fontSize: 15,
  border: "1px solid #ddd",
  borderRadius: 10,
  outline: "none",
  background: "#fafafa",
  transition: "border-color 0.2s",
  fontFamily: "inherit",
};