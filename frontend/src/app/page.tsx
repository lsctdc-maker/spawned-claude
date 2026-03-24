'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const features = [
  {
    icon: '💬',
    title: 'AI 기획 인터뷰',
    description: 'AI가 상품에 대해 질문하고, 답변을 바탕으로 핵심 USP를 자동 추출합니다.',
  },
  {
    icon: '🎨',
    title: '톤앤매너 커스터마이징',
    description: '신뢰형, 감성형, 임팩트형 중 브랜드에 맞는 스타일을 선택하세요.',
  },
  {
    icon: '📐',
    title: '860px 한국형 레이아웃',
    description: '쿠팡, 네이버 스마트스토어 등 국내 플랫폼에 최적화된 레이아웃입니다.',
  },
  {
    icon: '✏️',
    title: '실시간 편집 & 정렬',
    description: '드래그앤드롭으로 섹션 순서 변경, 클릭으로 내용 즉시 편집 가능합니다.',
  },
  {
    icon: '📥',
    title: 'HTML & 이미지 내보내기',
    description: 'HTML 파일 또는 고화질 이미지로 바로 다운로드하여 쇼핑몰에 적용하세요.',
  },
  {
    icon: '🚀',
    title: '5분 만에 완성',
    description: '5단계 간단한 과정으로 전문가 수준의 상세페이지를 빠르게 만들 수 있습니다.',
  },
];

const steps = [
  { num: '01', title: '상품 정보 입력', desc: '카테고리, 상품명, 가격 등 기본 정보를 입력합니다.' },
  { num: '02', title: 'AI 인터뷰', desc: 'AI가 상품에 대해 질문하고, USP를 자동 추출합니다.' },
  { num: '03', title: '톤앤매너 선택', desc: '상세페이지의 전체 분위기와 카피 스타일을 결정합니다.' },
  { num: '04', title: '미리보기 & 편집', desc: '생성된 상세페이지를 실시간으로 편집하고 정렬합니다.' },
  { num: '05', title: '다운로드', desc: 'HTML 또는 이미지로 다운로드하여 바로 사용합니다.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* 히어로 */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
                <span className="animate-pulse">🟢</span>
                AI 기반 자동 생성 서비스
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                상세페이지,{' '}
                <span className="gradient-text">AI가 대신</span>{' '}
                만들어드립니다
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                상품 정보만 입력하면 한국형 쇼핑몰에 최적화된
                전문가 수준의 상세페이지가 5분 만에 완성됩니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/create"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  무료로 시작하기
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border-2 border-gray-200 text-gray-700 font-medium hover:border-primary-300 hover:text-primary-600 transition-all"
                >
                  사용 방법 보기
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 기능 소개 */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                왜 디테일메이커인가요?
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                복잡한 상세페이지 제작 과정을 AI가 간단하게 해결합니다.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 사용 방법 */}
        <section id="how-it-works" className="py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                5단계로 완성하세요
              </h2>
              <p className="text-gray-500">
                복잡한 과정 없이, 누구나 쉽게 만들 수 있습니다.
              </p>
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
                  {idx < steps.length - 1 && (
                    <div className="absolute left-7 top-14 w-0.5 h-full bg-primary-100 -ml-px" />
                  )}
                  <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-extrabold text-lg flex-shrink-0 shadow-lg z-10">
                    {step.num}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
              지금 바로 시작하세요
            </h2>
            <p className="text-primary-100 text-lg mb-10 max-w-xl mx-auto">
              회원가입 없이 무료로 상세페이지를 만들어볼 수 있습니다.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-white text-primary-700 font-bold text-lg hover:shadow-2xl transition-all hover:-translate-y-1"
            >
              상세페이지 만들기
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
