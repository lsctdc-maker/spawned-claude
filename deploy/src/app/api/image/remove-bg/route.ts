import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '이미지 파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // remove.bg API 키 확인
    const removeBgKey = process.env.REMOVEBG_API_KEY;

    if (removeBgKey) {
      // remove.bg API 사용
      const rbFormData = new FormData();
      rbFormData.append('image_file', file);
      rbFormData.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': removeBgKey,
        },
        body: rbFormData,
      });

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return NextResponse.json({
          success: true,
          imageUrl: `data:image/png;base64,${base64}`,
          method: 'remove.bg',
        });
      } else {
        const errorText = await response.text();
        console.error('remove.bg API error:', errorText);
        // API 실패 시 원본 반환으로 폴백
      }
    }

    // 옵션 C: API 키 없거나 API 실패 시 원본 이미지 그대로 반환
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type || 'image/png';

    return NextResponse.json({
      success: true,
      imageUrl: `data:${mimeType};base64,${base64}`,
      method: 'passthrough',
      message: 'REMOVEBG_API_KEY가 설정되지 않아 원본 이미지를 사용합니다.',
    });
  } catch (error) {
    console.error('Remove background error:', error);
    return NextResponse.json(
      { success: false, error: '배경 제거 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
