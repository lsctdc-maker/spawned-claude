'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { X, Mail, Lock, LogIn } from 'lucide-react';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: '가입 확인 이메일을 발송했습니다. 이메일을 확인해주세요.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-[#1c1b1b] border border-[#464555]/20 rounded-2xl p-8 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#e5e2e1]/30 hover:text-[#e5e2e1] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-[#e5e2e1] mb-6">
              {mode === 'login' ? '로그인' : '회원가입'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e5e2e1]/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일"
                  required
                  className="w-full bg-[#0a0a0a] border border-[#464555]/30 rounded-lg py-3 pl-10 pr-4 text-sm text-[#e5e2e1] placeholder:text-[#e5e2e1]/25 focus:outline-none focus:border-[#c3c0ff]/50 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e5e2e1]/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  required
                  className="w-full bg-[#0a0a0a] border border-[#464555]/30 rounded-lg py-3 pl-10 pr-4 text-sm text-[#e5e2e1] placeholder:text-[#e5e2e1]/25 focus:outline-none focus:border-[#c3c0ff]/50 transition-all"
                />
              </div>

              {message && (
                <p className={`text-sm ${message.type === 'error' ? 'text-[#ffb4ab]' : 'text-[#a0e7a0]'}`}>
                  {message.text}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-[#c3c0ff] to-[#e5e2e1] text-[#0f0069] font-bold text-sm disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#464555]/20" />
              <span className="text-xs text-[#e5e2e1]/30">또는</span>
              <div className="flex-1 h-px bg-[#464555]/20" />
            </div>

            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-[#464555]/30 text-sm text-[#e5e2e1]/70 hover:bg-[#2a2a2a] transition-all"
            >
              <LogIn className="w-4 h-4" />
              Google로 계속하기
            </button>

            <p className="mt-5 text-center text-xs text-[#e5e2e1]/40">
              {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              {' '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null); }}
                className="text-[#c3c0ff] hover:underline"
              >
                {mode === 'login' ? '회원가입' : '로그인'}
              </button>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
