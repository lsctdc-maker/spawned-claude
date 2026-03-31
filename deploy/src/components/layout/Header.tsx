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
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-[#e5e2e1]/8 shadow-[0_10px_40px_rgba(229,226,225,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-black tracking-tighter text-[#e5e2e1] font-headline">
                DetailMaker
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/plan"
                className="text-[#e5e2e1]/70 hover:text-[#c3c0ff] transition-colors font-headline font-bold tracking-tight text-sm"
              >
                AI 기획
              </Link>
              <Link
                href="/design"
                className="text-[#e5e2e1]/70 hover:text-[#c3c0ff] transition-colors font-headline font-bold tracking-tight text-sm"
              >
                이미지 제작
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className="text-[#e5e2e1]/70 hover:text-[#c3c0ff] transition-colors font-headline font-bold tracking-tight text-sm flex items-center gap-1"
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
                    <span className="hidden sm:block text-xs text-[#e5e2e1]/40 max-w-[120px] truncate">
                      {user.email}
                    </span>
                    <button
                      onClick={signOut}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[#e5e2e1]/50 hover:text-[#e5e2e1] hover:bg-[#2a2a2a] transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setLoginOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-[#e5e2e1]/70 hover:text-[#e5e2e1] border border-[#464555]/20 hover:border-[#464555]/40 transition-all"
                  >
                    <User className="w-3.5 h-3.5" />
                    로그인
                  </button>
                )
              )}
              <Link
                href="/plan"
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#c3c0ff] to-[#e5e2e1] text-[#0f0069] font-headline font-bold text-sm hover:scale-[1.03] active:scale-[0.97] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
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
