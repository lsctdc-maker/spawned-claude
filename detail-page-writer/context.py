class ProjectContext:
    def __init__(self, raw_manuscript: str):
        self.raw_manuscript = raw_manuscript     # 원본 원고
        self.product_info = {}                   # STEP 1 결과
        self.reference_pages = []                # STEP 2 결과
        self.structure_pattern = {}              # STEP 3 결과
        self.draft = ""                          # STEP 4 결과
        self.review_history = []                 # 검토 이력 (실패 이유 누적)
        self.final_manuscript = ""               # 최종 완성 원고

    def to_prompt_context(self) -> str:
        """현재까지 파악한 모든 맥락을 프롬프트용 문자열로 변환"""
        parts = [f"[원본 원고]\n{self.raw_manuscript}"]

        if self.product_info:
            parts.append(f"[상품 분석 결과]\n{self.product_info}")

        if self.structure_pattern:
            parts.append(f"[레퍼런스 구조 패턴]\n{self.structure_pattern}")

        if self.review_history:
            failures = "\n".join([
                f"- {r['round']}차 시도: {r['score']}점 / 실패 이유: {r['reason']}"
                for r in self.review_history
            ])
            parts.append(f"[이전 검토 실패 이력 — 반드시 반영할 것]\n{failures}")

        return "\n\n".join(parts)
