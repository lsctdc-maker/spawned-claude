'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const planFeatures = [
  { title: 'AI 브랜드 인터뷰', description: '제품에 대한 심층 인터뷰를 통해 핵심 USP를 도출합니다.' },
  { title: '한국형 9단계 구조', description: '후킹 → 공감 → 솔루션 → 특장점 → 사회적 증거 → CTA까지.' },
  { title: 'SEO 키워드 자동 추출', description: '네이버/쿠팡 검색에 최적화된 키워드를 자동 추출합니다.' },
];

const designFeatures = [
  { title: '860px 한국형 레이아웃', description: '쿠팡, 스마트스토어 규격에 최적화된 상세페이지.' },
  { title: '배경 제거 + 이미지 편집', description: '제품 사진 배경 자동 제거, 섹션별 이미지 교체.' },
  { title: 'PNG 다운로드', description: '고해상도(2x) PNG를 즉시 다운로드하여 바로 적용.' },
];

const planSteps = [
  { num: '01', title: '제품 등록', desc: '카테고리, 상품명, 이미지 등 제품의 기본 프로필을 구성합니다.' },
  { num: '02', title: 'AI 브랜드 인터뷰', desc: 'AI가 제품에 대해 전문적인 질문을 던지고, 답변에서 셀링포인트를 추출합니다.' },
  { num: '03', title: '원고 확인/수정', desc: '생성된 9단계 원고를 섹션별로 검토하고 수정합니다.' },
];

const designSteps = [
  { num: '04', title: '이미지 에디터', desc: '원고 기반 섹션 이미지를 생성하고, 폰트/색상/레이아웃을 커스터마이징합니다.' },
  { num: '05', title: '내보내기', desc: '섹션별 PNG 또는 전체 1장 이미지로 다운로드합니다.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* 히어로 */}
        <section className="py-24 sm:py-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#191F28] mb-6 leading-[1.2]">
                팔리는 상세페이지를
                <br />
                설계해주는 <span className="text-[#3182F6]">AI 기획자</span>
              </h1>
              <p className="text-base text-[#8B95A1] mb-10 max-w-xl mx-auto leading-relaxed">
                상품 정보만 알려주세요. AI가 기획자처럼 질문하고,
                <br />
                카테고리에 최적화된 상세페이지를 설계합니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/plan?new=1"
                  className="inline-flex items-center justify-center bg-[#3182F6] text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-[#1B64DA] active:scale-[0.98] transition-all duration-200"
                >
                  AI 기획 시작하기
                </Link>
                <Link
                  href="/design"
                  className="inline-flex items-center justify-center border border-[#E5E8EB] text-[#4E5968] px-8 py-4 rounded-xl font-semibold text-base hover:bg-[#F4F5F7] active:scale-[0.98] transition-all duration-200"
                >
                  이미지 제작 바로가기
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 두 서비스 소개 */}
        <section className="py-20 sm:py-28 border-t border-[#F4F5F7]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#191F28] mb-3">두 가지 전문 서비스</h2>
              <p className="text-[#8B95A1] max-w-md mx-auto">AI 기획과 이미지 제작을 독립적으로, 또는 연속으로 활용하세요.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* AI 기획 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-8 rounded-2xl bg-[#F8F9FA] border border-[#E5E8EB] hover:border-[#3182F6]/30 transition-all duration-200"
              >
                <div className="text-xs font-semibold text-[#3182F6] uppercase tracking-wider mb-4">AI 기획</div>
                <h3 className="text-lg font-bold text-[#191F28] mb-2">원고를 설계합니다</h3>
                <p className="text-sm text-[#8B95A1] mb-6 leading-relaxed">
                  AI 인터뷰 → 한국형 9단계 원고 자동 생성.
                  <br />후킹부터 CTA까지 전략적으로.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {planFeatures.map((f, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-[#4E5968]">
                      <span className="text-[#3182F6] flex-shrink-0">—</span>
                      <span><strong className="font-medium text-[#191F28]">{f.title}</strong> {f.description}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/plan?new=1" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-[#3182F6]/10 text-[#3182F6] font-semibold text-sm hover:bg-[#3182F6]/20 active:scale-[0.98] transition-all duration-200">
                  AI 기획 시작하기
                </Link>
              </motion.div>

              {/* 이미지 제작 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="p-8 rounded-2xl bg-[#F8F9FA] border border-[#E5E8EB] hover:border-[#00C471]/30 transition-all duration-200"
              >
                <div className="text-xs font-semibold text-[#00C471] uppercase tracking-wider mb-4">이미지 제작</div>
                <h3 className="text-lg font-bold text-[#191F28] mb-2">이미지로 완성합니다</h3>
                <p className="text-sm text-[#8B95A1] mb-6 leading-relaxed">
                  원고를 시각화. 배경 제거 + 섹션 이미지 편집
                  <br />+ PNG 다운로드까지.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {designFeatures.map((f, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-[#4E5968]">
                      <span className="text-[#00C471] flex-shrink-0">—</span>
                      <span><strong className="font-medium text-[#191F28]">{f.title}</strong> {f.description}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/design" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-[#00C471]/10 text-[#00C471] font-semibold text-sm hover:bg-[#00C471]/20 active:scale-[0.98] transition-all duration-200">
                  이미지 제작 시작하기
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 5단계 프로세스 */}
        <section className="py-20 sm:py-28 border-t border-[#F4F5F7]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#191F28] mb-3">5단계 완성 워크플로우</h2>
              <p className="text-[#8B95A1]">AI 기획 3단계 + 이미지 제작 2단계</p>
            </div>
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <p className="text-xs font-semibold text-[#3182F6] uppercase tracking-wider mb-6">AI 기획</p>
                <div className="space-y-0">
                  {planSteps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex gap-4 items-start relative pb-8 last:pb-0"
                    >
                      {idx < planSteps.length - 1 && <div className="absolute left-5 top-12 w-px h-[calc(100%-2rem)] bg-[#E5E8EB]" />}
                      <div className="w-10 h-10 rounded-xl bg-[#EBF4FF] text-[#3182F6] font-bold text-sm flex items-center justify-center flex-shrink-0 z-10">
                        {step.num}
                      </div>
                      <div className="pt-1.5">
                        <h3 className="font-semibold text-[#191F28] text-sm mb-1">{step.title}</h3>
                        <p className="text-xs text-[#8B95A1] leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#00C471] uppercase tracking-wider mb-6">이미지 제작</p>
                <div className="space-y-0">
                  {designSteps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex gap-4 items-start relative pb-8 last:pb-0"
                    >
                      {idx < designSteps.length - 1 && <div className="absolute left-5 top-12 w-px h-[calc(100%-2rem)] bg-[#E5E8EB]" />}
                      <div className="w-10 h-10 rounded-xl bg-[#E8F7F0] text-[#00C471] font-bold text-sm flex items-center justify-center flex-shrink-0 z-10">
                        {step.num}
                      </div>
                      <div className="pt-1.5">
                        <h3 className="font-semibold text-[#191F28] text-sm mb-1">{step.title}</h3>
                        <p className="text-xs text-[#8B95A1] leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#3182F6] py-20 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">지금 바로 시작하세요</h2>
            <p className="text-white/70 text-base mb-10 max-w-lg mx-auto">무료로 시작하기. AI 기획과 이미지 제작을 경험할 수 있습니다.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/plan?new=1" className="inline-flex items-center justify-center bg-white text-[#3182F6] px-8 py-4 rounded-xl font-semibold text-base hover:bg-white/90 active:scale-[0.98] transition-all duration-200">
                AI 기획 시작하기
              </Link>
              <Link href="/design" className="inline-flex items-center justify-center border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-white/10 active:scale-[0.98] transition-all duration-200">
                이미지 제작 바로가기
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
