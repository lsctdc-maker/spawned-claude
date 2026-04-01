'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Zap, Clock, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: '자동화된 AI 디자인',
    description: '이미지와 텍스트만 입력하면 AI가 최적의 레이아웃을 제안합니다.',
  },
  {
    icon: Clock,
    title: '빠른 제작 속도',
    description: '몇 분 안에 전문적인 상세페이지를 완성하여 시간을 절약하세요.',
  },
  {
    icon: TrendingUp,
    title: '매출 향상 효과',
    description: '구매 전환율을 높이는 최적화된 디자인으로 성과를 극대화하세요.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-24 sm:py-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#191F28] mb-6 leading-[1.2]">
                AI로 만드는 상세페이지,
                <br />
                시작부터 끝까지 토스처럼
              </h1>
              <p className="text-base text-[#8B95A1] mb-10 max-w-md mx-auto leading-relaxed">
                복잡한 과정 없이, 누구나 쉽게 고퀄리티 상세페이지를 완성합니다.
                <br />
                지금 바로 무료로 체험해보세요.
              </p>
              <Link
                href="/plan"
                className="inline-flex items-center justify-center bg-[#3182F6] text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-[#1B64DA] active:scale-[0.98] transition-all duration-200"
              >
                DetailMaker 시작하기
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-[#F4F5F7]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-[#EBF4FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-[#3182F6]" />
                  </div>
                  <h3 className="font-semibold text-[#191F28] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#8B95A1] leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
