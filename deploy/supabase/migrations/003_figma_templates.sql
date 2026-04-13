-- Figma 템플릿 테이블
-- 디자이너가 Figma에서 만든 섹션 템플릿을 저장
-- 배경 PNG + 텍스트/이미지 슬롯 메타데이터

CREATE TABLE IF NOT EXISTS figma_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 기본 정보
  name TEXT NOT NULL,
  section_type TEXT NOT NULL,
  variant_id TEXT NOT NULL,

  -- Figma 원본 참조
  figma_file_key TEXT NOT NULL,
  figma_node_id TEXT NOT NULL,
  figma_last_synced TIMESTAMPTZ DEFAULT now(),

  -- 배경 이미지 (Figma export → Supabase Storage)
  bg_image_url TEXT NOT NULL,
  bg_image_width INT DEFAULT 860,
  bg_image_height INT NOT NULL,

  -- 슬롯 정의
  text_slots JSONB NOT NULL DEFAULT '[]',
  image_slots JSONB NOT NULL DEFAULT '[]',

  -- 분류 태그
  category_tags TEXT[] DEFAULT '{}',
  tone_tags TEXT[] DEFAULT '{}',
  style_tags TEXT[] DEFAULT '{}',
  color_scheme TEXT DEFAULT 'dark',

  -- 관리
  quality_score INT DEFAULT 5 CHECK (quality_score BETWEEN 1 AND 10),
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- figma_node_id 기준 upsert용
  UNIQUE(figma_file_key, figma_node_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_ft_section_active
  ON figma_templates(section_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ft_category
  ON figma_templates USING GIN(category_tags);
CREATE INDEX IF NOT EXISTS idx_ft_quality
  ON figma_templates(quality_score DESC) WHERE is_active = true;

-- RLS
ALTER TABLE figma_templates ENABLE ROW LEVEL SECURITY;

-- 모든 인증 사용자가 활성 템플릿 읽기 가능
CREATE POLICY "Anyone can read active templates"
  ON figma_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

-- service_role만 쓰기 가능 (figma-sync API가 service_role key 사용)
-- Supabase의 service_role은 RLS를 bypass하므로 별도 policy 불필요
