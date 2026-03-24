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
        {/* 아바타 */}
        <div
          className={`
            flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm
            ${isAI ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}
          `}
        >
          {isAI ? '🤖' : '👤'}
        </div>

        {/* 말풍선 */}
        <div
          className={`
            px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
            ${
              isAI
                ? 'bg-gray-50 text-gray-800 rounded-tl-sm'
                : 'bg-primary-600 text-white rounded-tr-sm'
            }
          `}
        >
          {isTyping ? (
            <div className="flex items-center gap-1.5 py-1">
              <motion.span
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0 }}
              />
              <motion.span
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
              />
              <motion.span
                className="w-2 h-2 bg-gray-400 rounded-full"
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
