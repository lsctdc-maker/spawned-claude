// Font utilities — extracted from Step4ImageEditor

export function extractFontName(rec: string): string {
  const slash = rec.match(/\/\s*([^—\-\n(]+)/);
  if (slash) return slash[1].trim();
  const eng = rec.match(/([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+)*(?:\s+KR)?)/);
  if (eng) return eng[1].trim();
  return 'Noto Sans KR';
}

export function loadGoogleFont(name: string) {
  if (typeof document === 'undefined') return;
  const id = `gf-${name.replace(/\s/g, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/\s/g, '+')}:wght@400;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

export const FONT_OPTIONS = [
  { label: 'Noto Sans KR', value: 'Noto Sans KR' },
  { label: 'Noto Serif KR', value: 'Noto Serif KR' },
  { label: 'Black Han Sans', value: 'Black Han Sans' },
  { label: 'Jua', value: 'Jua' },
  { label: 'Pretendard', value: 'Pretendard' },
  { label: 'IBM Plex Sans KR', value: 'IBM Plex Sans KR' },
  { label: 'Gowun Dodum', value: 'Gowun Dodum' },
  { label: 'Gowun Batang', value: 'Gowun Batang' },
  { label: 'Nanum Gothic', value: 'Nanum Gothic' },
  { label: 'Nanum Myeongjo', value: 'Nanum Myeongjo' },
  { label: 'Do Hyeon', value: 'Do Hyeon' },
  { label: 'Gothic A1', value: 'Gothic A1' },
  { label: 'Sunflower', value: 'Sunflower' },
];
