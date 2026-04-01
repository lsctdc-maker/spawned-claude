'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Users, FolderOpen, BarChart2, Shield } from 'lucide-react';

type AdminTab = 'stats' | 'users' | 'projects';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  status: string;
  created_at: string;
  profiles?: { email: string } | null;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<AdminTab>('stats');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({ users: 0, projects: 0, recent: 0 });

  useEffect(() => {
    if (!loading && !user) { router.push('/'); return; }
    if (!loading && user) {
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.role !== 'admin') { router.push('/'); return; }
          setIsAdmin(true);
          setChecking(false);
        });
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!isAdmin) return;
    // Fetch stats
    Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('projects').select('id', { count: 'exact' }),
      supabase.from('projects').select('id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    ]).then(([u, p, r]) => {
      setStats({ users: u.count ?? 0, projects: p.count ?? 0, recent: r.count ?? 0 });
    });
  }, [isAdmin]);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setProfiles(data ?? []);
  };

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('id, title, status, created_at, profiles(email)')
      .order('created_at', { ascending: false })
      .limit(100);
    setProjects((data ?? []) as unknown as Project[]);
  };

  useEffect(() => {
    if (!isAdmin) return;
    if (tab === 'users') fetchUsers();
    if (tab === 'projects') fetchProjects();
  }, [tab, isAdmin]);

  const handleRoleChange = async (id: string, role: string) => {
    await supabase.from('profiles').update({ role }).eq('id', id);
    setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, role } : p));
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[#8B95A1] text-sm">확인 중...</div>
      </div>
    );
  }

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'stats', label: '통계', icon: <BarChart2 className="w-4 h-4" /> },
    { key: 'users', label: '사용자 관리', icon: <Users className="w-4 h-4" /> },
    { key: 'projects', label: '프로젝트 관리', icon: <FolderOpen className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-5 h-5 text-[#3182F6]" />
          <h1 className="text-xl font-bold text-[#191F28]">관리자 패널</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white border border-[#E5E8EB] rounded-xl p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-[#3182F6]/10 text-[#3182F6]'
                  : 'text-[#8B95A1] hover:text-[#191F28]'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        {tab === 'stats' && (
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: '총 사용자', value: stats.users, color: 'text-[#3182F6]' },
              { label: '총 프로젝트', value: stats.projects, color: 'text-[#00B8D9]' },
              { label: '최근 7일 신규', value: stats.recent, color: 'text-[#FF8B00]' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-[#E5E8EB] rounded-xl p-6 shadow-sm"
              >
                <p className="text-xs text-[#8B95A1] mb-2">{s.label}</p>
                <p className={`text-4xl font-bold ${s.color}`}>{s.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="bg-white border border-[#E5E8EB] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E8EB] text-[#8B95A1] text-xs">
                  <th className="text-left px-4 py-3">이메일</th>
                  <th className="text-left px-4 py-3">이름</th>
                  <th className="text-left px-4 py-3">역할</th>
                  <th className="text-left px-4 py-3">가입일</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-b border-[#E5E8EB]/50 hover:bg-[#F4F5F7] transition-colors">
                    <td className="px-4 py-3 text-[#191F28]">{p.email}</td>
                    <td className="px-4 py-3 text-[#8B95A1]">{p.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={p.role}
                        onChange={(e) => handleRoleChange(p.id, e.target.value)}
                        className="bg-[#F4F5F7] border border-[#E5E8EB] rounded text-xs text-[#191F28] px-2 py-1 focus:outline-none"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-[#D1D6DB] text-xs">
                      {new Date(p.created_at).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {profiles.length === 0 && (
              <p className="text-center py-10 text-[#D1D6DB] text-sm">사용자가 없습니다.</p>
            )}
          </div>
        )}

        {/* Projects */}
        {tab === 'projects' && (
          <div className="bg-white border border-[#E5E8EB] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E8EB] text-[#8B95A1] text-xs">
                  <th className="text-left px-4 py-3">제목</th>
                  <th className="text-left px-4 py-3">작성자</th>
                  <th className="text-left px-4 py-3">상태</th>
                  <th className="text-left px-4 py-3">생성일</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b border-[#E5E8EB]/50 hover:bg-[#F4F5F7] transition-colors">
                    <td className="px-4 py-3 text-[#191F28] max-w-[200px] truncate">{p.title}</td>
                    <td className="px-4 py-3 text-[#8B95A1] text-xs">
                      {p.profiles?.email ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3182F6]/10 text-[#3182F6] border border-[#3182F6]/15">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#D1D6DB] text-xs">
                      {new Date(p.created_at).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {projects.length === 0 && (
              <p className="text-center py-10 text-[#D1D6DB] text-sm">프로젝트가 없습니다.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
