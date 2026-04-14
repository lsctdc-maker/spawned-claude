import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth-server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image-preview';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export async function POST(request: NextRequest) {
  // Auth check
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) return authResult;

  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'GEMINI_API_KEY not configured' },
      { status: 500 }
    );
  }

  try {
    const { prompt, width = 860, height = 600 } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'prompt is required' },
        { status: 400 }
      );
    }

    // Style anchor (landing-page-generator pattern)
    const fullPrompt = `Generate a PHOTOREALISTIC professional image for a Korean product detail page section.

=== ABSOLUTE DIMENSION REQUIREMENTS ===
1. EXACT SIZE: ${width}x${height} pixels
2. FULL BLEED: Content fills ENTIRE canvas with NO margins
3. WIDTH LOCK: Output MUST be exactly ${width} pixels wide

=== ULTRA-REALISTIC PHOTOGRAPHY STYLE (CRITICAL) ===
- Canon 5D Mark IV / Sony A7R IV quality
- Korean models with NATURAL skin texture (NOT airbrushed)
- Professional studio lighting
- Style reference: Amorepacific, Sulwhasoo flagship advertising
- ABSOLUTELY NO illustration, cartoon, or vector art

=== KOREAN TEXT REQUIREMENTS ===
- All text MUST be in Korean (한국어)
- Text must be clearly readable against the background
- Use professional Korean typography (Noto Sans KR style)
- Headline: bold, large (32-48px equivalent)
- Body: regular weight, smaller (16-20px equivalent)

=== CONTENT ===
${prompt}

=== CHECKLIST ===
- EXACTLY ${width}x${height} pixels
- Looks like REAL photograph taken by professional photographer
- Korean text is perfectly rendered and readable
- Full bleed, no margins or borders
- No watermarks or placeholder text`;

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: `Gemini API returned ${response.status}` },
        { status: 502 }
      );
    }

    const result = await response.json();
    const parts = result.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData) {
        const mime = part.inlineData.mimeType || 'image/png';
        const dataUrl = `data:${mime};base64,${part.inlineData.data}`;
        return NextResponse.json({ success: true, imageUrl: dataUrl });
      }
    }

    return NextResponse.json(
      { success: false, error: 'No image in Gemini response' },
      { status: 500 }
    );
  } catch (e) {
    console.error('Gemini generation error:', e);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
