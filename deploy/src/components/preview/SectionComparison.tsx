'use client';

import { useCallback } from 'react';
import { ComparisonContent } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { useDetailPage } from '@/hooks/useDetailPage';
import EditableText from './EditableText';

interface SectionComparisonProps {
  content: ComparisonContent;
  sectionId: string;
}

export default function SectionComparison({ content, sectionId }: SectionComparisonProps) {
  const { state, dispatch } = useDetailPage();
  const { productInfo } = state;

  const category = productInfo.category ? CATEGORIES[productInfo.category as keyof typeof CATEGORIES] : null;
  const primaryColor = category?.primary || '#c3c0ff';

  const updateHeader = useCallback((idx: number, value: string) => {
    const newHeaders = [...content.headers];
    newHeaders[idx] = value;
    dispatch({ type: 'UPDATE_SECTION', payload: { id: sectionId, data: { content: { ...content, headers: newHeaders } } } });
  }, [dispatch, sectionId, content]);

  const updateRow = useCallback((rowIdx: number, field: 'label' | 'value', value: string, valIdx?: number) => {
    const newRows = [...content.rows];
    if (field === 'label') {
      newRows[rowIdx] = { ...newRows[rowIdx], label: value };
    } else if (valIdx !== undefined) {
      const newValues = [...newRows[rowIdx].values];
      newValues[valIdx] = value;
      newRows[rowIdx] = { ...newRows[rowIdx], values: newValues };
    }
    dispatch({ type: 'UPDATE_SECTION', payload: { id: sectionId, data: { content: { ...content, rows: newRows } } } });
  }, [dispatch, sectionId, content]);

  return (
    <div className="py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-headline font-bold text-center mb-8" style={{ color: primaryColor }}>비교표</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-bold rounded-tl-xl" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>기능</th>
                {content.headers.map((header, idx) => (
                  <th key={idx} className="px-4 py-3 text-center font-bold" style={{ backgroundColor: `${primaryColor}10`, color: '#e5e2e1' }}>
                    <EditableText
                      tag="span"
                      value={header}
                      onSave={(v) => updateHeader(idx, v)}
                      className="font-bold"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.rows.map((row, idx) => (
                <tr key={idx} className="border-t border-[#464555]/15">
                  <td className="px-4 py-3 font-semibold text-[#e5e2e1]" style={{ backgroundColor: `${primaryColor}08` }}>
                    <EditableText tag="span" value={row.label} onSave={(v) => updateRow(idx, 'label', v)} className="font-semibold" />
                  </td>
                  {row.values.map((val, valIdx) => (
                    <td key={valIdx} className="px-4 py-3 text-center text-[#c7c4d8]">
                      <EditableText tag="span" value={val} onSave={(v) => updateRow(idx, 'value', v, valIdx)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
