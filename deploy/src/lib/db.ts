import { supabase } from './supabase';
import { ManuscriptSection, ColorPalette, FontRecommendation, ProductInfo, InterviewMessage, USP } from './types';

export interface ProjectInterviewData {
  messages: InterviewMessage[];
  extractedUSPs: USP[];
  completed: boolean;
}

export interface ProjectData {
  id?: string;
  title: string;
  status?: string;
  product_info?: ProductInfo | null;
  interview_data?: ProjectInterviewData | null;
  manuscript_sections?: ManuscriptSection[] | null;
  color_palette?: ColorPalette | null;
  font_recommendation?: FontRecommendation | null;
  keywords?: string[] | null;
  tone?: string | null;
  current_step?: number;
  created_at?: string;
  updated_at?: string;
}

export async function saveProject(data: Omit<ProjectData, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: ProjectData | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: '로그인이 필요합니다.' };

  const { data: result, error } = await supabase
    .from('projects')
    .insert({ ...data, user_id: user.id })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: result, error: null };
}

export async function updateProject(id: string, data: Partial<ProjectData>): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('projects')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function loadProject(id: string): Promise<{ data: ProjectData | null; error: string | null }> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function listProjects(): Promise<{ data: ProjectData[]; error: string | null }> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, status, created_at, updated_at, product_info')
    .order('updated_at', { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

export async function deleteProject(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  return { error: error?.message ?? null };
}
