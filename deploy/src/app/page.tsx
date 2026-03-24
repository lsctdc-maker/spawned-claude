'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const features = [
  { icon: '💬', title: 'AI 브랜드 인터뷰', description: '제품에 대한 심층 인터뷰를 통해 핵심 USP를 도출합니다. 대충 쓴 설명이 아닌, 전략적 카피를 생성합니다.' },
  { icon: '🎨', title: '톤앤매너 설계', description: '신뢰형, 감성형, 임팩트형 — 브랜드 아이덴티티에 맞는 톤을 선택하면 전체 카피가 일관되게 조율됩니다.' },
  { icon: '📐', title: '860px 한국형 레이아웃', description: '쿠팡, 네이버 스마트스토어 등 국내 주요 플랫폼에 최적화된 상세페이지 규격을 기본 제공합니다.' },
  { icon: '✏️', title: '실시간 에디터', description: '생성된 상세페이지를 실시간으로 편집하고, 드래그 앤 드롭으로 섹션 순서를 자유롭게 재배치할 수 있습니다.' },
  { icon: '📥', title: 'HTML & 이미지 익스포트', description: '완성된 상세페이지를 HTML 파일 또는 고해상도 이미지로 즉시 다운로드하여 쇼핑몰에 바로 적용합니다.' },
  { icon: '🚀', title: '5분 완성 워크플로우', description: '상품 정보 입력부터 최종 다운로드까지, 5단계 프로세스로 전문가 수준의 결과물을 빠르게 완성합니다.' },
];

const steps = [
  { num: '01', title: '상품 정보 입력', desc: '카테고리, 상품명, 가격, 이미지 등 제품의 기본 프로필을 구성합니다.' },
  { num: '02', title: 'AI 브랜드 인터뷰', desc: 'AI가 제품에 대해 전문적인 질문을 던지고, 답변에서 핵심 셀링포인트를 추출합니다.' },
  { num: '03', title: '톤앤매너 선택', desc: '브랜드에 맞는 카피 스타일을 선택하면 전체 상세페이지의 톤이 일관되게 조율됩니다.' },
  { num: '04', title: '미리보기 & 편집', desc: '생성된 상세페이지를 실시간으로 확인하고, 섹션별 편집과 순서 재배치를 진행합니다.' },
  { num: '05', title: '익스포트', desc: 'HTML 파일 또는 고해상도 이미지로 다운로드하여 쇼핑몰에 바로 적용합니다.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* 히어로 */}
        <section className="relative overflow-hidden bg-[#131313]">
          {/* Decorative blur blob */}
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 blur-[150px] rounded-full -z-10" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                <span className="ai-pulse">•</span>
                The Digital Atelier
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-headline font-extrabold tracking-tight mb-6 leading-[1.1]">
                <span className="gradient-text">팔리는 상세페이지를</span>
                <br />
                <span className="gradient-text">설계해주는</span>
                <br />
                <span className="text-[#e5e2e1]">AI 기획자</span>
              </h1>

              {/* Subtext */}
              <p className="text-lg text-[#e5e2e1]/60 mb-12 max-w-2xl mx-auto leading-relaxed">
                상품 정보만 알려주세요. AI가 기획자처럼 질문하고, 카테고리에 최적화된 상세페이지를 설계합니다.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/create" className="inline-flex items-center justify-center primary-gradient text-[#0f0069] px-10 py-5 rounded-full font-headline font-extrabold text-lg shadow-cta hover:scale-[1.02] active:scale-[0.98] transition-all">
                  아틀리에 입장하기
                </Link>
                <a href="#how-it-works" className="inline-flex items-center justify-center border border-outline-variant/20 text-[#e5e2e1]/70 px-8 py-4 rounded-full font-medium hover:bg-surface-container-high transition-all">
                  작동 원리 보기
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 기능 소개 */}
        <section className="bg-[#131313] py-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-headline font-extrabold text-[#e5e2e1] mb-4">왜 DetailMaker인가요?</h2>
              <p className="text-[#e5e2e1]/50">이커머스 전문가를 위해 설계된 AI 상세페이지 아틀리에</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-8 rounded-xl bg-surface-container border border-outline-variant/10 hover:border-primary/30 hover:bg-surface-container-high transition-all duration-300 group"
                >
                  <div className="text-3xl mb-6">{feature.icon}</div>
                  <h3 className="text-lg font-headline font-bold text-[#e5e2e1] mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-sm text-[#e5e2e1]/50 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 5단계 프로세스 */}
        <section id="how-it-works" className="bg-[#131313] py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-headline font-extrabold text-[#e5e2e1] mb-4">5단계로 완성하는 프리미엄 상세페이지</h2>
              <p className="text-[#e5e2e1]/50">복잡한 제작 과정을 직관적인 워크플로우로 재설계했습니다.</p>
            </div>
            <div className="space-y-0">
              {steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="flex gap-6 items-start relative pb-12 last:pb-0"
                >
                  {idx < steps.length - 1 && <div className="absolute left-7 top-14 w-0.5 h-full bg-primary/20 -ml-px" />}
                  <div className="w-14 h-14 rounded-2xl primary-gradient text-[#0f0069] font-headline font-extrabold text-lg flex items-center justify-center shadow-cta flex-shrink-0 z-10">{step.num}</div>
                  <div className="pt-2">
                    <h3 className="text-xl font-headline font-bold text-[#e5e2e1] mb-1">{step.title}</h3>
                    <p className="text-[#e5e2e1]/50">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="primary-gradient py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-[#0f0069] mb-6">지금, 아틀리에에 입장하세요</h2>
            <p className="text-[#0f0069]/70 text-lg mb-10 max-w-xl mx-auto">회원가입 없이 무료로 프리미엄 상세페이지를 경험할 수 있습니다.</p>
            <Link href="/create" className="inline-flex items-center justify-center bg-[#0f0069] text-primary px-10 py-5 rounded-full font-headline font-bold text-lg hover:shadow-2xl transition-all hover:-translate-y-1">
              무료로 시작하기
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
