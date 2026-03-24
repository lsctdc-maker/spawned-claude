'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDetailPage } from '@/hooks/useDetailPage';
import { exportHTML } from '@/lib/api';
import { ToneKey } from '@/lib/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

type ExportFormat = 'html' | 'image';

export default function Step5Export() {
  const { state, dispatch } = useDetailPage();
  const { generatedSections, productInfo, selectedTone } = state;
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('html');
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleExportHTML = async () => {
    setIsExporting(true);
    try {
      const result = await exportHTML(
        generatedSections.filter((s) => s.visible),
        productInfo,
        selectedTone as ToneKey
      );

      if (result.success && result.data) {
        const blob = new Blob([result.data.html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${productInfo.name || 'detail-page'}_상세페이지.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportDone(true);
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportImage = async () => {
    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const previewEl = document.querySelector('.preview-container');
      if (previewEl) {
        const canvas = await html2canvas(previewEl as HTMLElement, {
          width: 860,
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        });
        const link = document.createElement('a');
        link.download = `${productInfo.name || 'detail-page'}_상세페이지.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setExportDone(true);
      }
    } catch (err) {
      console.error('Image export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (selectedFormat === 'html') {
      handleExportHTML();
    } else {
      handleExportImage();
    }
  };

  const formats: { key: ExportFormat; label: string; icon: string; desc: string }[] = [
    {
      key: 'html',
      label: 'HTML 파일',
      icon: '🌐',
      desc: '쇼핑몰에 바로 적용 가능한 HTML 파일',
    },
    {
      key: 'image',
      label: '이미지 (PNG)',
      icon: '🖼️',
      desc: '고화질 이미지로 다운로드',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">내보내기</h2>
        <p className="text-gray-500">완성된 상세페이지를 원하는 형식으로 다운로드하세요.</p>
      </div>

      {/* 완성 요약 */}
      <Card variant="elevated" padding="lg">
        <div className="text-center space-y-3">
          <div className="text-4xl">🎉</div>
          <h3 className="text-xl font-bold text-gray-900">상세페이지 완성!</h3>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <span>상품: <strong>{productInfo.name}</strong></span>
            <span>섹션: <strong>{generatedSections.filter((s) => s.visible).length}개</strong></span>
            <span>톤: <strong>{selectedTone}</strong></span>
          </div>
        </div>
      </Card>

      {/* 포맷 선택 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">내보내기 형식</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {formats.map((format) => (
            <Card
              key={format.key}
              variant="interactive"
              padding="md"
              selected={selectedFormat === format.key}
              onClick={() => {
                setSelectedFormat(format.key);
                setExportDone(false);
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{format.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{format.label}</h4>
                  <p className="text-xs text-gray-500">{format.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 다운로드 완료 */}
      {exportDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center"
        >
          다운로드가 완료되었습니다!
        </motion.div>
      )}

      {/* 버튼 */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>
          이전 (미리보기)
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => dispatch({ type: 'RESET' })}
          >
            새로 만들기
          </Button>
          <Button
            size="lg"
            onClick={handleExport}
            loading={isExporting}
            disabled={isExporting}
          >
            {isExporting ? '내보내는 중...' : '다운로드'}
          </Button>
        </div>
      </div>

      {/* 이미지 내보내기용 숨겨진 프리뷰 */}
      <div ref={previewRef} className="hidden" />
    </motion.div>
  );
}
