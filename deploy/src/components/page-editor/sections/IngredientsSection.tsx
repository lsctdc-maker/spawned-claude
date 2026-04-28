'use client';

import EditableText from '../EditableText';
import { Leaf, Droplets, FlaskConical, Pill } from 'lucide-react';

interface Ingredient {
  icon: string;
  name: string;
  description: string;
}

interface IngredientsSectionProps {
  title: string;
  subtitle: string;
  ingredients: Ingredient[];
  accentColor: string;
  bgColor: string;
  onUpdate?: (field: string, value: string) => void;
}

const ICONS: Record<string, React.ComponentType<any>> = {
  leaf: Leaf, droplets: Droplets, flask: FlaskConical, pill: Pill,
};

export default function IngredientsSection({
  title, subtitle, ingredients, accentColor, bgColor, onUpdate,
}: IngredientsSectionProps) {
  return (
    <div className="w-[860px] py-20 px-16 text-center" style={{ backgroundColor: bgColor }}>
      <div className="w-10 h-[3px] rounded-full mx-auto mb-5" style={{ backgroundColor: '#FFFFFF50' }} />
      <EditableText
        value={title}
        onChange={v => onUpdate?.('title', v)}
        tag="h2"
        className="text-[36px] font-black tracking-tight text-white mb-3"
      />
      <EditableText
        value={subtitle}
        onChange={v => onUpdate?.('subtitle', v)}
        tag="p"
        className="text-[15px] text-white/70 mb-12"
      />

      {/* 성분 카드 그리드 */}
      <div className="grid grid-cols-3 gap-4 max-w-[660px] mx-auto">
        {ingredients.map((ing, i) => {
          const Icon = ICONS[ing.icon] || Leaf;
          return (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <EditableText
                value={ing.name}
                onChange={v => onUpdate?.(`ing-name-${i}`, v)}
                tag="h3"
                className="text-[16px] font-bold text-white mb-1"
              />
              <EditableText
                value={ing.description}
                onChange={v => onUpdate?.(`ing-desc-${i}`, v)}
                tag="p"
                className="text-[12px] text-white/70 leading-[1.6]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
