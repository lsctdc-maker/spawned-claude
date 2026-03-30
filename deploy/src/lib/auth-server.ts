import { NextRequest, NextResponse } from 'next/server';
import { createClient, User } from '@supabase/supabase-js';

export async function requireAuth(request: NextRequest): Promise<User | NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: '인증이 만료되었습니다. 다시 로그인해주세요.' }, { status: 401 });
  }

  return user;
}

export function isAuthError(result: User | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
