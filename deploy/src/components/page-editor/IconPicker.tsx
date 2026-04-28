'use client';

import { useState } from 'react';
import {
  Heart, Shield, Zap, Plus, Activity, Brain, Leaf, Sparkles, Check, Star,
  Award, BadgeCheck, ShieldCheck, Flame, Droplets, FlaskConical, Pill,
  Eye, Sun, Moon, Cloud, ThumbsUp, Gift, Clock, Target, Truck,
  Phone, Mail, MapPin, Globe, Lock, Unlock, Bell, Bookmark,
  Camera, Image, Play, Music, Mic, Video, Wifi, Battery,
  Coffee, Apple, Cake, Pizza, Utensils, Wine,
  Home, Building, Car, Bike, Plane,
  AlertTriangle, Info, HelpCircle, XCircle, CheckCircle,
  ArrowRight, ArrowUp, ArrowDown, ChevronRight, ExternalLink,
  Users, User, Baby, Dog,
  Scissors, Brush, Palette, PenTool, Ruler,
  Dumbbell, Medal, Trophy,
} from 'lucide-react';

const ICON_CATEGORIES: Record<string, { name: string; icons: { key: string; Icon: React.ComponentType<any> }[] }> = {
  popular: {
    name: '자주 사용',
    icons: [
      { key: 'heart', Icon: Heart }, { key: 'star', Icon: Star }, { key: 'check', Icon: Check },
      { key: 'shield', Icon: Shield }, { key: 'zap', Icon: Zap }, { key: 'sparkles', Icon: Sparkles },
      { key: 'thumbs-up', Icon: ThumbsUp }, { key: 'award', Icon: Award }, { key: 'target', Icon: Target },
      { key: 'check-circle', Icon: CheckCircle }, { key: 'plus', Icon: Plus }, { key: 'leaf', Icon: Leaf },
    ],
  },
  health: {
    name: '건강/뷰티',
    icons: [
      { key: 'activity', Icon: Activity }, { key: 'brain', Icon: Brain }, { key: 'droplets', Icon: Droplets },
      { key: 'flask', Icon: FlaskConical }, { key: 'pill', Icon: Pill }, { key: 'eye', Icon: Eye },
      { key: 'sun', Icon: Sun }, { key: 'flame', Icon: Flame }, { key: 'shield-check', Icon: ShieldCheck },
      { key: 'badge-check', Icon: BadgeCheck },
    ],
  },
  commerce: {
    name: '커머스',
    icons: [
      { key: 'truck', Icon: Truck }, { key: 'gift', Icon: Gift }, { key: 'clock', Icon: Clock },
      { key: 'phone', Icon: Phone }, { key: 'lock', Icon: Lock }, { key: 'globe', Icon: Globe },
      { key: 'users', Icon: Users }, { key: 'medal', Icon: Medal }, { key: 'trophy', Icon: Trophy },
    ],
  },
  food: {
    name: '식품',
    icons: [
      { key: 'coffee', Icon: Coffee }, { key: 'apple', Icon: Apple }, { key: 'cake', Icon: Cake },
      { key: 'utensils', Icon: Utensils }, { key: 'wine', Icon: Wine },
    ],
  },
  status: {
    name: '상태',
    icons: [
      { key: 'alert', Icon: AlertTriangle }, { key: 'info', Icon: Info },
      { key: 'help', Icon: HelpCircle }, { key: 'x-circle', Icon: XCircle },
    ],
  },
};

// 전체 아이콘 맵 (key → Component)
export const ALL_ICONS: Record<string, React.ComponentType<any>> = {};
Object.values(ICON_CATEGORIES).forEach(cat => {
  cat.icons.forEach(({ key, Icon }) => { ALL_ICONS[key] = Icon; });
});

interface IconPickerProps {
  currentIcon: string;
  onSelect: (iconKey: string) => void;
  onClose: () => void;
  accentColor?: string;
}

export default function IconPicker({ currentIcon, onSelect, onClose, accentColor = '#3182F6' }: IconPickerProps) {
  const [activeTab, setActiveTab] = useState('popular');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[400px] max-h-[480px] overflow-hidden"
        onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="px-5 py-4 border-b border-[#E5E8EB]">
          <h3 className="text-sm font-bold text-[#191F28]">아이콘 선택</h3>
          <p className="text-[10px] text-[#8B95A1] mt-0.5">원하는 아이콘을 클릭하세요</p>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 px-4 pt-3 overflow-x-auto">
          {Object.entries(ICON_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-lg whitespace-nowrap transition-all ${
                activeTab === key
                  ? 'bg-[#3182F6] text-white'
                  : 'text-[#8B95A1] hover:bg-[#F4F5F7]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 아이콘 그리드 */}
        <div className="p-4 grid grid-cols-6 gap-2 max-h-[300px] overflow-y-auto">
          {ICON_CATEGORIES[activeTab]?.icons.map(({ key, Icon }) => (
            <button
              key={key}
              onClick={() => { onSelect(key); onClose(); }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${
                key === currentIcon
                  ? 'ring-2 ring-[#3182F6] bg-[#EBF4FF]'
                  : 'hover:bg-[#F4F5F7]'
              }`}
            >
              <Icon className="w-6 h-6" style={{ color: key === currentIcon ? accentColor : '#4E5968' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
