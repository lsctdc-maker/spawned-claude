'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import LoginModal from '@/components/auth/LoginModal';
import { LogOut, User, LayoutDashboard } from 'lucide-react';

export default function Header() {
  const { user, signOut, loading } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E8EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold tracking-tight text-[#191F28]">
                DetailMaker
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/plan"
                className="text-[#4E5968] hover:text-[#3182F6] transition-colors font-semibold text-sm"
              >
                AI 기획
              </Link>
              <Link
                href="/design"
                className="text-[#4E5968] hover:text-[#3182F6] transition-colors font-semibold text-sm"
              >
                이미지 제작
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className="text-[#4E5968] hover:text-[#3182F6] transition-colors font-semibold text-sm flex items-center gap-1"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  내 프로젝트
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {!loading && (
                user ? (
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:block text-xs text-[#8B95A1] max-w-[120px] truncate">
                      {user.email}
                    </span>
                    <button
                      onClick={signOut}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[#8B95A1] hover:text-[#191F28] hover:bg-[#F4F5F7] transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setLoginOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-[#4E5968] hover:text-[#191F28] hover:bg-[#F4F5F7] transition-all"
                  >
                    <User className="w-3.5 h-3.5" />
                    로그인
                  </button>
                )
              )}
              <Link
                href="/plan"
                className="px-5 py-2.5 rounded-xl bg-[#3182F6] text-white font-semibold text-sm hover:bg-[#1B64DA] active:scale-[0.98] transition-all duration-200"
              >
                시작하기
              </Link>
            </div>
          </div>
        </div>
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
