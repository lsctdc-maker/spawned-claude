'use client';

import { motion } from 'framer-motion';

interface ChatBubbleProps {
  role: 'ai' | 'user';
  content: string;
  isTyping?: boolean;
}

export default function ChatBubble({ role, content, isTyping = false }: ChatBubbleProps) {
  const isAI = role === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div className={`flex items-start gap-2.5 max-w-[85%] ${isAI ? '' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div
          className={`
            flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm
            ${isAI ? 'bg-[#2a2a2a] text-[#c3c0ff]' : 'bg-[#2a2a2a] text-[#e5e2e1]'}
          `}
        >
          {isAI ? '🤖' : '👤'}
        </div>

        {/* Bubble */}
        <div
          className={`
            px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
            ${
              isAI
                ? 'glass-card text-[#e5e2e1] rounded-tl-sm'
                : 'primary-gradient text-[#0f0069] rounded-tr-sm'
            }
          `}
        >
          {isTyping ? (
            <div className="flex items-center gap-1.5 py-1">
              <motion.span
                className="w-2 h-2 bg-[#e5e2e1]/40 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0 }}
              />
              <motion.span
                className="w-2 h-2 bg-[#e5e2e1]/40 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
              />
              <motion.span
                className="w-2 h-2 bg-[#e5e2e1]/40 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
              />
            </div>
          ) : (
            content
          )}
        </div>
      </div>
    </motion.div>
  );
}
