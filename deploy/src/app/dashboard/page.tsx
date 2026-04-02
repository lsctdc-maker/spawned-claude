'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import { useAuth } from '@/components/auth/AuthProvider';
import { listProjects, deleteProject, ProjectData } from '@/lib/db';
import { Trash2, ExternalLink, Plus, FolderOpen } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      listProjects().then(({ data }) => {
        setProjects(data);
        setFetching(false);
      });
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('이 프로젝트를 삭제하시겠습니까?')) return;
    setDeletingId(id);
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  };

  const statusLabel: Record<string, string> = {
    draft: '초안',
    planning: '기획 중',
    designing: '제작 중',
    completed: '완료',
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[#8B95A1] text-sm">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-[#191F28]">내 프로젝트</h1>
            <p className="text-sm text-[#8B95A1] mt-1">{projects.length}개의 프로젝트</p>
          </div>
          <button
            onClick={() => router.push('/plan')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3182F6] text-white font-bold text-sm hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            새 프로젝트
          </button>
        </div>

        {fetching ? (
          <div className="text-center py-20 text-[#D1D6DB] text-sm">불러오는 중...</div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <FolderOpen className="w-12 h-12 text-[#D1D6DB]" />
            <p className="text-[#8B95A1] text-sm">아직 저장된 프로젝트가 없습니다.</p>
            <button
              onClick={() => router.push('/plan')}
              className="px-6 py-3 rounded-full border border-[#3182F6]/30 text-[#3182F6] text-sm hover:bg-[#3182F6]/10 transition-all"
            >
              첫 프로젝트 만들기
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => router.push(`/plan?id=${project.id}`)}
                className="bg-white border border-[#E5E8EB] rounded-xl p-5 hover:border-[#3182F6]/30 transition-all group shadow-sm cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-[#191F28] text-sm line-clamp-2 leading-snug">
                    {project.title}
                  </h3>
                  <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-[#3182F6]/10 text-[#3182F6] border border-[#3182F6]/15">
                    {statusLabel[project.status ?? 'draft'] ?? project.status}
                  </span>
                </div>

                {project.product_info && (
                  <p className="text-xs text-[#8B95A1] mb-4 line-clamp-2">
                    {(project.product_info as { shortDescription?: string }).shortDescription ?? ''}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#D1D6DB]">
                    {project.updated_at ? new Date(project.updated_at).toLocaleDateString('ko-KR') : ''}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/design?id=${project.id}`); }}
                      className="p-1.5 rounded-lg text-[#8B95A1] hover:text-[#3182F6] hover:bg-[#3182F6]/10 transition-all"
                      title="이미지 제작으로 열기"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); project.id && handleDelete(project.id); }}
                      disabled={deletingId === project.id}
                      className="p-1.5 rounded-lg text-[#8B95A1] hover:text-[#F04452] hover:bg-[#F04452]/10 transition-all"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
