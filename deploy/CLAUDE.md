# DetailMaker - AI 상세페이지 자동 생성 서비스

## Architecture

- **Framework**: Next.js 14.2.35 (App Router)
- **Canvas**: fabric.js 6.x (v6 API: `Image.fromURL()` returns Promise)
- **State**: Zustand with persist (`dm_canvas_editor` localStorage key)
- **Auth**: Supabase Auth + RLS
- **Deploy**: Vercel

## Directory Structure

```
deploy/
  src/
    app/
      api/          # API routes (image, manuscript, copywriting, etc.)
      design/       # Canvas editor page (Step 4)
      seed/         # Input/seed page (Step 1-3)
      create/       # Create flow
    components/
      canvas-editor/  # fabric.js canvas editor (~20 files)
        hooks/        # useImageGeneration, usePreCompose, etc.
        state/        # canvasStore.ts (Zustand)
        templates/    # Section templates + compose logic
        panels/       # Sidebar panels (layers, properties, templates)
      steps/          # Step 1-3 components
    lib/              # Shared utilities
    data/             # Static data (design-knowledge.json)
  context/            # AI context files (design system, prompts, voice)
```

## Image Generation

- **Primary**: Gemini API (`/api/generate-gemini`) - complete section images with text+layout
- **Fallback**: Stock images (Unsplash/Pexels via `/api/image`)
- **DALL-E**: NOT USED (removed)
- OpenAI is text-only (copywriting, interview, manuscript)

## Canvas Editor Rules

- Width: 860px fixed (Naver SmartStore standard)
- fabric.js v6: `Image.fromURL(url)` returns `Promise<Image>` (not callback)
- Section state: `canvasStore.ts` manages per-section JSON, images, thumbnails
- Pre-compose: Background offscreen compose for non-active sections
- Gemini images: Display full-canvas (no text overlay), user edits via fabric.js

## Coding Conventions

- UI text: Korean
- Auth: Use `authFetch()` from `lib/auth-fetch.ts` for client-side API calls
- Server auth: Use `getAuthenticatedUser()` from `lib/auth-server.ts`
- API responses: `{ success: boolean, ...data }` or `{ error: string }`
- No DALL-E, no Figma template pipeline activation

## Environment Variables

```
OPENAI_API_KEY=        # Text generation only (manuscript, copywriting)
GEMINI_API_KEY=        # Image generation (primary)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
