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
    <div className="min-h-screen flex flex-col noise-overlay">
      <Header />
      <main className="flex-1">
        {/* 히어로 */}
        <section className="relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[180px] rounded-full -z-10" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-tertiary-container/5 blur-[150px] rounded-full -z-10" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-32 sm:py-40 text-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary text-sm font-medium mb-10">
                <span className="ai-pulse">•</span>
                The Digital Atelier
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-headline font-extrabold tracking-tight mb-8 leading-[1.08]">
                <span className="gradient-text">팔리는 상세페이지를</span>
                <br />
                <span className="gradient-text">설계해주는</span>
                <br />
                <span className="text-[#e5e2e1]">AI 기획자</span>
              </h1>
              <p className="text-lg text-[#e5e2e1]/50 mb-14 max-w-xl mx-auto leading-relaxed">
                상품 정보만 알려주세요.<br className="sm:hidden" /> AI가 기획자처럼 질문하고,<br />
                카테고리에 최적화된 상세페이지를 설계합니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/plan"
                  className="inline-flex items-center justify-center primary-gradient text-[#0f0069] px-10 py-5 rounded-full font-headline font-extrabold text-lg shadow-cta hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                  AI 기획 시작하기
                </Link>
                <Link
                  href="/design"
                  className="inline-flex items-center justify-center border border-[#e5e2e1]/10 text-[#e5e2e1]/60 px-8 py-4 rounded-full font-medium hover:bg-[#e5e2e1]/5 hover:text-[#e5e2e1]/80 hover:border-[#e5e2e1]/20 transition-all duration-300"
                >
                  이미지 제작 바로가기
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 두 서비스 소개 */}
        <section className="py-28 sm:py-36 border-t border-[#e5e2e1]/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-semibold mb-4">Services</p>
              <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-[#e5e2e1] mb-4">두 가지 전문 서비스</h2>
              <p className="text-[#e5e2e1]/40 max-w-md mx-auto">AI 기획과 이미지 제작을 독립적으로, 또는 연속으로 활용하세요.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* AI 기획 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="group p-8 sm:p-10 rounded-2xl bg-[#c3c0ff]/[0.03] border border-[#c3c0ff]/10 hover:border-[#c3c0ff]/25 transition-all duration-300"
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#c3c0ff]/70 font-semibold mb-5">AI 기획</div>
                <h3 className="text-xl font-headline font-bold text-[#e5e2e1] mb-3">원고를 설계합니다</h3>
                <p className="text-sm text-[#e5e2e1]/40 mb-8 leading-relaxed">
                  AI 인터뷰 → 한국형 9단계 원고 자동 생성.<br />후킹부터 CTA까지 전략적으로.
                </p>
                <ul className="space-y-3 mb-10">
                  {planFeatures.map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#e5e2e1]/50">
                      <span className="text-[#c3c0ff]/50 flex-shrink-0 mt-0.5">—</span>
                      <span><strong className="text-[#e5e2e1]/70 font-medium">{f.title}</strong> {f.description}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/plan" className="inline-flex items-center justify-center w-full py-3.5 rounded-xl bg-[#c3c0ff]/10 border border-[#c3c0ff]/15 text-[#c3c0ff] font-semibold text-sm hover:bg-[#c3c0ff]/15 hover:border-[#c3c0ff]/25 active:scale-[0.98] transition-all duration-300">
                  AI 기획 시작하기
                </Link>
              </motion.div>

              {/* 이미지 제작 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group p-8 sm:p-10 rounded-2xl bg-[#a0e7e5]/[0.03] border border-[#a0e7e5]/10 hover:border-[#a0e7e5]/25 transition-all duration-300"
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#a0e7e5]/70 font-semibold mb-5">이미지 제작</div>
                <h3 className="text-xl font-headline font-bold text-[#e5e2e1] mb-3">이미지로 완성합니다</h3>
                <p className="text-sm text-[#e5e2e1]/40 mb-8 leading-relaxed">
                  원고를 시각화. 배경 제거 + 섹션 이미지 편집<br />+ PNG 다운로드까지.
                </p>
                <ul className="space-y-3 mb-10">
                  {designFeatures.map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#e5e2e1]/50">
                      <span className="text-[#a0e7e5]/50 flex-shrink-0 mt-0.5">—</span>
                      <span><strong className="text-[#e5e2e1]/70 font-medium">{f.title}</strong> {f.description}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/design" className="inline-flex items-center justify-center w-full py-3.5 rounded-xl bg-[#a0e7e5]/10 border border-[#a0e7e5]/15 text-[#a0e7e5] font-semibold text-sm hover:bg-[#a0e7e5]/15 hover:border-[#a0e7e5]/25 active:scale-[0.98] transition-all duration-300">
                  이미지 제작 시작하기
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 5단계 프로세스 */}
        <section id="how-it-works" className="py-28 sm:py-36 border-t border-[#e5e2e1]/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-semibold mb-4">Process</p>
              <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-[#e5e2e1] mb-4">5단계 완성 워크플로우</h2>
              <p className="text-[#e5e2e1]/40">AI 기획 3단계 + 이미지 제작 2단계</p>
            </div>
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#c3c0ff]/60 font-semibold mb-8">AI 기획</p>
                <div className="space-y-0">
                  {planSteps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="flex gap-4 items-start relative pb-10 last:pb-0"
                    >
                      {idx < planSteps.length - 1 && <div className="absolute left-5 top-12 w-px h-[calc(100%-2rem)] bg-[#c3c0ff]/10" />}
                      <div className="w-10 h-10 rounded-xl bg-[#c3c0ff]/8 border border-[#c3c0ff]/15 text-[#c3c0ff]/80 font-headline font-bold text-sm flex items-center justify-center flex-shrink-0 z-10 tabular-nums">
                        {step.num}
                      </div>
                      <div className="pt-1.5">
                        <h3 className="font-semibold text-[#e5e2e1] text-sm mb-1">{step.title}</h3>
                        <p className="text-xs text-[#e5e2e1]/35 leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#a0e7e5]/60 font-semibold mb-8">이미지 제작</p>
                <div className="space-y-0">
                  {designSteps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="flex gap-4 items-start relative pb-10 last:pb-0"
                    >
                      {idx < designSteps.length - 1 && <div className="absolute left-5 top-12 w-px h-[calc(100%-2rem)] bg-[#a0e7e5]/10" />}
                      <div className="w-10 h-10 rounded-xl bg-[#a0e7e5]/8 border border-[#a0e7e5]/15 text-[#a0e7e5]/80 font-headline font-bold text-sm flex items-center justify-center flex-shrink-0 z-10 tabular-nums">
                        {step.num}
                      </div>
                      <div className="pt-1.5">
                        <h3 className="font-semibold text-[#e5e2e1] text-sm mb-1">{step.title}</h3>
                        <p className="text-xs text-[#e5e2e1]/35 leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative primary-gradient py-24 sm:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')] opacity-[0.03]" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-[#0f0069] mb-5">지금, 아틀리에에 입장하세요</h2>
            <p className="text-[#0f0069]/60 text-lg mb-10 max-w-lg mx-auto">회원가입 없이 무료로 AI 기획과 이미지 제작을 경험할 수 있습니다.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/plan" className="inline-flex items-center justify-center bg-[#0f0069] text-primary px-10 py-4 rounded-full font-headline font-bold text-base hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]">
                AI 기획 시작하기
              </Link>
              <Link href="/design" className="inline-flex items-center justify-center bg-[#0f0069]/20 text-[#0f0069] border border-[#0f0069]/30 px-8 py-4 rounded-full font-headline font-bold text-base hover:bg-[#0f0069]/30 active:scale-[0.98] transition-all duration-300">
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
