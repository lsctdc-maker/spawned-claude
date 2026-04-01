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
            ${isAI ? 'bg-[#EBF4FF] text-[#3182F6]' : 'bg-[#F4F5F7] text-[#4E5968]'}
          `}
        >
          {isAI ? 'AI' : ''}
        </div>

        {/* Bubble */}
        <div
          className={`
            px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
            ${
              isAI
                ? 'bg-[#F4F5F7] text-[#191F28] rounded-tl-sm'
                : 'bg-[#3182F6] text-white rounded-tr-sm'
            }
          `}
        >
          {isTyping ? (
            <div className="flex items-center gap-1.5 py-1">
              <motion.span
                className="w-2 h-2 bg-[#8B95A1] rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0 }}
              />
              <motion.span
                className="w-2 h-2 bg-[#8B95A1] rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
              />
              <motion.span
                className="w-2 h-2 bg-[#8B95A1] rounded-full"
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
