'use client';

import { useState } from 'react';
import { ComparisonContent, TextStyle } from '@/lib/types';
import { useDetailPage } from '@/hooks/useDetailPage';
import { CATEGORIES } from '@/lib/constants';
import TextStyleBar from '@/components/ui/TextStyleBar';

const DEFAULT_STYLE: TextStyle = { fontSize: 16, color: '#111827' };

interface SectionComparisonProps {
  content: ComparisonContent;
  sectionId: string;
  styles?: TextStyle;
}

export default function SectionComparison({ content, sectionId, styles }: SectionComparisonProps) {
  const { state, dispatch } = useDetailPage();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [editStyles, setEditStyles] = useState<TextStyle>(styles ?? DEFAULT_STYLE);

  const category = state.productInfo.category
    ? CATEGORIES[state.productInfo.category as keyof typeof CATEGORIES]
    : null;
  const primaryColor = category?.primary || '#6366F1';

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_SECTION',
      payload: { id: sectionId, data: { content: editContent, styles: editStyles } },
    });
    setIsEditing(false);
  };

  const updateRow = (rowIdx: number, field: 'label' | number, value: string) => {
    const updated = { ...editContent, rows: [...editContent.rows] };
    if (field === 'label') {
      updated.rows[rowIdx] = { ...updated.rows[rowIdx], label: value };
    } else {
      const values = [...updated.rows[rowIdx].values];
      values[field] = value;
      updated.rows[rowIdx] = { ...updated.rows[rowIdx], values };
    }
    setEditContent(updated);
  };

  if (isEditing) {
    return (
      <div className="p-6 bg-gray-50 space-y-4">
        <TextStyleBar style={editStyles} onChange={setEditStyles} />
        <table className="w-full text-sm">
          <thead>
            <tr>
              {editContent.headers.map((h, i) => (
                <th key={i} className="px-2 py-1">
                  <input
                    value={h}
                    onChange={(e) => {
                      const headers = [...editContent.headers];
                      headers[i] = e.target.value;
                      setEditContent({ ...editContent, headers });
                    }}
                    className="w-full px-2 py-1 rounded border border-gray-300 text-center font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                    style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {editContent.rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="px-2 py-1">
                  <input
                    value={row.label}
                    onChange={(e) => updateRow(rowIdx, 'label', e.target.value)}
                    className="w-full px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
                  />
                </td>
                {row.values.map((v, vIdx) => (
                  <td key={vIdx} className="px-2 py-1">
                    <input
                      value={v}
                      onChange={(e) => updateRow(rowIdx, vIdx, e.target.value)}
                      className="w-full px-2 py-1 rounded border border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                      style={{ fontSize: editStyles.fontSize, color: editStyles.color }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-200">취소</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700">저장</button>
        </div>
      </div>
    );
  }

  return (
    <div className="section-editable py-16 px-8 cursor-pointer" onClick={() => setIsEditing(true)}>
      <div className="section-edit-overlay">
        <span className="px-3 py-1.5 rounded-lg bg-white shadow-md text-xs text-gray-500">클릭하여 편집</span>
      </div>
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">비교해보세요</h2>
      <div className="max-w-2xl mx-auto overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {content.headers.map((header, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-center font-bold ${
                    idx === 1 ? 'text-white rounded-t-2xl' : 'bg-gray-50'
                  }`}
                  style={idx === 1 ? { backgroundColor: primaryColor } : { color: styles?.color ?? 'rgb(55 65 81)' }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-gray-100">
                <td className="px-6 py-4 font-medium" style={{ color: styles?.color ?? 'rgb(55 65 81)', fontSize: styles?.fontSize }}>{row.label}</td>
                {row.values.map((val, valIdx) => (
                  <td
                    key={valIdx}
                    className={`px-6 py-4 text-center ${valIdx === 0 ? 'font-bold' : ''}`}
                    style={{ fontSize: styles?.fontSize, color: valIdx === 0 ? (styles?.color ?? primaryColor) : (styles?.color ?? 'rgb(107 114 128)') }}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
