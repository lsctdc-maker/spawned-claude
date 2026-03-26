'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const planFeatures = [
  { title: 'AI 브랜드 인터뷰', description: '제품에 대한 심층 인터뷰를 통해 핵심 USP를 도출합니다. 전략적 카피를 생성합니다.' },
  { title: '한국형 9단계 구조', description: '후킹 → 문제 공감 → 솔루션 → 특장점 → 사회적 증거 → CTA, 검증된 흐름으로 원고를 작성합니다.' },
  { title: 'SEO 키워드 자동 추출', description: '네이버/쿠팡 검색에 최적화된 키워드를 원고 생성과 동시에 자동으로 추출합니다.' },
];

const designFeatures = [
  { title: '860px 한국형 레이아웃', description: '쿠팡, 네이버 스마트스토어 등 국내 주요 플랫폼에 최적화된 상세페이지 규격을 기본 제공합니다.' },
  { title: '배경 제거 + 이미지 편집', description: '제품 사진 배경을 자동으로 제거하고 섹션별 이미지를 교체하여 완성도 높은 시각물을 만듭니다.' },
  { title: 'PNG 다운로드', description: '섹션별 또는 전체 1장으로 고해상도(2x) PNG를 즉시 다운로드하여 쇼핑몰에 바로 적용합니다.' },
];

const planSteps = [
  { num: '01', title: '제품 등록', desc: '카테고리, 상품명, 이미지 등 제품의 기본 프로필을 구성합니다.' },
  { num: '02', title: 'AI 브랜드 인터뷰', desc: 'AI가 제품에 대해 전문적인 질문을 던지고, 답변에서 핵심 셀링포인트를 추출합니다.' },
  { num: '03', title: '원고 확인/수정', desc: '생성된 9단계 원고를 섹션별로 검토하고 수정합니다.' },
];

const designSteps = [
  { num: '04', title: '이미지 에디터', desc: '원고 기반 섹션 이미지를 생성하고, 폰트/색상/레이아웃을 커스터마이징합니다.' },
  { num: '05', title: '내보내기', desc: '섹션별 PNG 또는 전체 1장 이미지로 다운로드합니다.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* 히어로 */}
        <section className="relative overflow-hidden bg-[#131313]">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 blur-[150px] rounded-full -z-10" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                <span className="ai-pulse">•</span>
                The Digital Atelier
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-headline font-extrabold tracking-tight mb-6 leading-[1.1]">
                <span className="gradient-text">팔리는 상세페이지를</span>
                <br />
                <span className="gradient-text">설계해주는</span>
                <br />
                <span className="text-[#e5e2e1]">AI 기획자</span>
              </h1>
              <p className="text-lg text-[#e5e2e1]/60 mb-12 max-w-2xl mx-auto leading-relaxed">
                상품 정보만 알려주세요. AI가 기획자처럼 질문하고, 카테고리에 최적화된 상세페이지를 설계합니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/plan" className="inline-flex items-center justify-center primary-gradient text-[#0f0069] px-10 py-5 rounded-full font-headline font-extrabold text-lg shadow-cta hover:scale-[1.02] active:scale-[0.98] transition-all">
                  AI 기획 시작하기
                </Link>
                <Link href="/design" className="inline-flex items-center justify-center border border-outline-variant/20 text-[#e5e2e1]/70 px-8 py-4 rounded-full font-medium hover:bg-surface-container-high transition-all">
                  이미지 제작 바로가기
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 두 서비스 소개 */}
        <section className="bg-[#131313] py-24 border-t border-[#e5e2e1]/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-headline font-extrabold text-[#e5e2e1] mb-3">두 가지 전문 서비스</h2>
              <p className="text-[#e5e2e1]/50">AI 기획과 이미지 제작을 독립적으로, 또는 연속으로 활용하세요.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* AI 기획 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-[#c3c0ff]/5 border border-[#c3c0ff]/15 hover:border-[#c3c0ff]/30 transition-all"
              >
                <div className="text-[10px] uppercase tracking-widest text-[#c3c0ff] font-bold mb-4">AI 기획</div>
                <h3 className="text-xl font-headline font-bold text-[#e5e2e1] mb-3">원고를 설계합니다</h3>
                <p className="text-sm text-[#e5e2e1]/50 mb-6 leading-relaxed">
                  AI 인터뷰 → 한국형 9단계 원고 자동 생성. 후킹부터 CTA까지 전략적으로.
                </p>
                <ul className="space-y-2 mb-8">
                  {planFeatures.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#e5e2e1]/60">
                      <span className="text-[#c3c0ff] flex-shrink-0 mt-0.5">—</span>
                      <span><strong className="text-[#e5e2e1]/80">{f.title}:</strong> {f.description}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/plan" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-[#c3c0ff]/15 border border-[#c3c0ff]/25 text-[#c3c0ff] font-bold text-sm hover:bg-[#c3c0ff]/20 transition-all">
                  AI 기획 시작하기
                </Link>
              </motion.div>

              {/* 이미지 제작 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-[#a0e7e5]/5 border border-[#a0e7e5]/15 hover:border-[#a0e7e5]/30 transition-all"
              >
                <div className="text-[10px] uppercase tracking-widest text-[#a0e7e5] font-bold mb-4">이미지 제작</div>
                <h3 className="text-xl font-headline font-bold text-[#e5e2e1] mb-3">이미지로 완성합니다</h3>
                <p className="text-sm text-[#e5e2e1]/50 mb-6 leading-relaxed">
                  원고를 시각화. 배경 제거 + 섹션 이미지 편집 + PNG 다운로드까지.
                </p>
                <ul className="space-y-2 mb-8">
                  {designFeatures.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#e5e2e1]/60">
                      <span className="text-[#a0e7e5] flex-shrink-0 mt-0.5">—</span>
                      <span><strong className="text-[#e5e2e1]/80">{f.title}:</strong> {f.description}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/design" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-[#a0e7e5]/15 border border-[#a0e7e5]/25 text-[#a0e7e5] font-bold text-sm hover:bg-[#a0e7e5]/20 transition-all">
                  이미지 제작 시작하기
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 5단계 프로세스 */}
        <section id="how-it-works" className="bg-[#131313] py-24 border-t border-[#e5e2e1]/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-headline font-extrabold text-[#e5e2e1] mb-3">5단계 완성 워크플로우</h2>
              <p className="text-[#e5e2e1]/50">AI 기획 3단계 + 이미지 제작 2단계</p>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#c3c0ff] font-bold mb-6">AI 기획</p>
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
                      {idx < planSteps.length - 1 && <div className="absolute left-5 top-10 w-0.5 h-full bg-[#c3c0ff]/15" />}
                      <div className="w-10 h-10 rounded-xl bg-[#c3c0ff]/15 border border-[#c3c0ff]/25 text-[#c3c0ff] font-headline font-bold text-sm flex items-center justify-center flex-shrink-0 z-10">
                        {step.num}
                      </div>
                      <div className="pt-1.5">
                        <h3 className="font-bold text-[#e5e2e1] text-sm mb-0.5">{step.title}</h3>
                        <p className="text-xs text-[#e5e2e1]/45 leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#a0e7e5] font-bold mb-6">이미지 제작</p>
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
                      {idx < designSteps.length - 1 && <div className="absolute left-5 top-10 w-0.5 h-full bg-[#a0e7e5]/15" />}
                      <div className="w-10 h-10 rounded-xl bg-[#a0e7e5]/15 border border-[#a0e7e5]/25 text-[#a0e7e5] font-headline font-bold text-sm flex items-center justify-center flex-shrink-0 z-10">
                        {step.num}
                      </div>
                      <div className="pt-1.5">
                        <h3 className="font-bold text-[#e5e2e1] text-sm mb-0.5">{step.title}</h3>
                        <p className="text-xs text-[#e5e2e1]/45 leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="primary-gradient py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-[#0f0069] mb-5">지금, 아틀리에에 입장하세요</h2>
            <p className="text-[#0f0069]/70 text-lg mb-8 max-w-xl mx-auto">회원가입 없이 무료로 AI 기획과 이미지 제작을 경험할 수 있습니다.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/plan" className="inline-flex items-center justify-center bg-[#0f0069] text-primary px-10 py-4 rounded-full font-headline font-bold text-base hover:shadow-2xl transition-all hover:-translate-y-1">
                AI 기획 시작하기
              </Link>
              <Link href="/design" className="inline-flex items-center justify-center bg-[#0f0069]/30 text-[#0f0069] border border-[#0f0069]/40 px-8 py-4 rounded-full font-headline font-bold text-base hover:bg-[#0f0069]/40 transition-all">
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
