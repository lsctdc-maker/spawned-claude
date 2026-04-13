-- 디자인 분석 결과 테이블
-- NAS 상세페이지 → 섹션 분리 → AI 분석 결과 저장

CREATE TABLE IF NOT EXISTS template_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 소스 정보
  source_file TEXT NOT NULL,
  section_index INT NOT NULL,
  section_image_url TEXT NOT NULL,

  -- AI 분석 결과
  section_type TEXT NOT NULL DEFAULT 'unknown',
  layout_pattern TEXT NOT NULL DEFAULT 'unknown',
  text_slots JSONB NOT NULL DEFAULT '[]',
  image_slots JSONB NOT NULL DEFAULT '[]',
  background_color TEXT DEFAULT '#ffffff',
  color_scheme TEXT DEFAULT 'light',
  category_fit TEXT[] DEFAULT '{}',
  tone_fit TEXT[] DEFAULT '{}',
  style_tags TEXT[] DEFAULT '{}',
  confidence REAL DEFAULT 0,

  -- PSD 원본 메타데이터 (있는 경우)
  psd_metadata JSONB,

  -- Figma 연동 상태
  figma_template_id UUID REFERENCES figma_templates(id),
  figma_synced BOOLEAN DEFAULT false,

  -- 관리
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(source_file, section_index)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_ta_section_type
  ON template_analysis(section_type);
CREATE INDEX IF NOT EXISTS idx_ta_category
  ON template_analysis USING GIN(category_fit);
CREATE INDEX IF NOT EXISTS idx_ta_approved
  ON template_analysis(is_approved) WHERE is_approved = true;

-- RLS
ALTER TABLE template_analysis ENABLE ROW LEVEL SECURITY;

-- 인증 사용자 읽기
CREATE POLICY "Anyone can read approved analyses"
  ON template_analysis FOR SELECT
  TO authenticated
  USING (is_approved = true);

-- ────────────────────────────────────────

-- 디자인 패턴 학습 데이터 테이블
-- "이런 원고 → 이런 디자인" 매핑 정보

CREATE TABLE IF NOT EXISTS design_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 매칭 조건
  section_type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tone TEXT NOT NULL DEFAULT 'trust',

  -- 레이아웃 선호도
  layout_pattern TEXT NOT NULL,
  layout_score REAL DEFAULT 1.0,

  -- 원고 조건
  title_length_range INT[] DEFAULT '{0,100}',
  body_length_range INT[] DEFAULT '{0,1000}',

  -- 색상 경향
  preferred_color_scheme TEXT DEFAULT 'dark',
  preferred_bg_colors TEXT[] DEFAULT '{}',

  -- 통계
  occurrence_count INT DEFAULT 1,
  avg_quality_score REAL DEFAULT 5.0,

  -- 관리
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(section_type, category, tone, layout_pattern)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_dp_lookup
  ON design_patterns(section_type, category, tone);

-- RLS
ALTER TABLE design_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read patterns"
  ON design_patterns FOR SELECT
  TO authenticated
  USING (true);
