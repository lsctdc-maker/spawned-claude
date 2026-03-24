'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDetailPage } from '@/hooks/useDetailPage';
import { INTERVIEW_QUESTIONS, DEFAULT_INTERVIEW_QUESTIONS } from '@/lib/constants';
import { CategoryKey, InterviewMessage, InterviewQuestion, USP } from '@/lib/types';
import { extractUSPs } from '@/lib/api';
import ChatBubble from '@/components/ui/ChatBubble';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Step2AIInterview() {
  const { state, dispatch } = useDetailPage();
  const { productInfo, interviewMessages, interviewCompleted, extractedUSPs } = state;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [editingUSP, setEditingUSP] = useState<string | null>(null);
  const [newUSPTitle, setNewUSPTitle] = useState('');
  const [newUSPDesc, setNewUSPDesc] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 카테고리별 질문 가져오기
  const questions: InterviewQuestion[] = productInfo.category
    ? INTERVIEW_QUESTIONS[productInfo.category as CategoryKey] || DEFAULT_INTERVIEW_QUESTIONS
    : DEFAULT_INTERVIEW_QUESTIONS;

  // 스크롤 하단으로
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 첫 질문 자동 표시
  useEffect(() => {
    if (interviewMessages.length === 0 && questions.length > 0) {
      const greeting: InterviewMessage = {
        id: 'ai-greeting',
        role: 'ai',
        content: `안녕하세요! ${productInfo.name || '상품'}에 대해 몇 가지 질문을 드리겠습니다.\n\n효과적인 상세페이지를 만들기 위해 꼼꼼히 답변해주시면 좋습니다. 건너뛰고 싶은 질문은 "건너뛰기" 버튼을 눌러주세요.`,
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_INTERVIEW_MESSAGE', payload: greeting });

      setTimeout(() => {
        const firstQ: InterviewMessage = {
          id: `ai-q-0`,
          role: 'ai',
          content: questions[0].question,
          timestamp: Date.now(),
        };
        dispatch({ type: 'ADD_INTERVIEW_MESSAGE', payload: firstQ });
      }, 800);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [interviewMessages, scrollToBottom]);

  // 답변 제출
  const handleSubmit = async (skip = false) => {
    const answer = skip ? '(건너뜀)' : userInput.trim();
    if (!skip && !answer) return;

    // 유저 메시지 추가
    const userMsg: InterviewMessage = {
      id: `user-${currentQuestionIndex}`,
      role: 'user',
      content: answer,
      timestamp: Date.now(),
    };
    dispatch({ type: 'ADD_INTERVIEW_MESSAGE', payload: userMsg });
    setUserInput('');

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < questions.length) {
      // 다음 질문
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, 1000));
      setIsTyping(false);

      const nextQ: InterviewMessage = {
        id: `ai-q-${nextIndex}`,
        role: 'ai',
        content: questions[nextIndex].question,
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_INTERVIEW_MESSAGE', payload: nextQ });
      setCurrentQuestionIndex(nextIndex);
    } else {
      // 모든 질문 완료
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, 800));
      setIsTyping(false);

      const completeMsg: InterviewMessage = {
        id: 'ai-complete',
        role: 'ai',
        content: '모든 질문이 완료되었습니다! 답변을 분석하여 핵심 USP(차별점)를 추출하겠습니다...',
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_INTERVIEW_MESSAGE', payload: completeMsg });
      dispatch({ type: 'SET_INTERVIEW_COMPLETED', payload: true });

      // USP 추출 API 호출
      setIsExtracting(true);
      const result = await extractUSPs(productInfo, [
        ...interviewMessages,
        userMsg,
      ]);
      setIsExtracting(false);

      if (result.success && result.data) {
        dispatch({ type: 'SET_USPS', payload: result.data.usps });
      }
    }

    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // USP 편집
  const handleEditUSP = (usp: USP) => {
    setEditingUSP(usp.id);
    setNewUSPTitle(usp.title);
    setNewUSPDesc(usp.description);
  };

  const handleSaveUSP = (id: string) => {
    dispatch({
      type: 'UPDATE_USP',
      payload: { id, data: { title: newUSPTitle, description: newUSPDesc } },
    });
    setEditingUSP(null);
  };

  const handleAddUSP = () => {
    const newUsp: USP = {
      id: `usp-new-${Date.now()}`,
      title: '새 USP',
      description: '여기에 설명을 입력하세요.',
      icon: '📌',
    };
    dispatch({ type: 'ADD_USP', payload: newUsp });
    handleEditUSP(newUsp);
  };

  const handleNext = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI 기획 인터뷰</h2>
        <p className="text-gray-500">
          상품에 대해 질문드리겠습니다. 답변을 바탕으로 USP를 추출합니다.
        </p>
      </div>

      {/* 채팅 영역 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="h-[400px] overflow-y-auto p-4 custom-scrollbar">
          <AnimatePresence>
            {interviewMessages.map((msg) => (
              <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
            ))}
          </AnimatePresence>
          {isTyping && <ChatBubble role="ai" content="" isTyping />}
          <div ref={chatEndRef} />
        </div>

        {/* 입력 영역 */}
        {!interviewCompleted && (
          <div className="chat-input-area">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  questions[currentQuestionIndex]?.placeholder || '답변을 입력하세요...'
                }
                rows={2}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <div className="flex flex-col gap-1.5">
                <Button size="sm" onClick={() => handleSubmit(false)} disabled={!userInput.trim()}>
                  전송
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSubmit(true)}
                  className="text-xs"
                >
                  건너뛰기
                </Button>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400 text-right">
              {currentQuestionIndex + 1} / {questions.length} 질문
            </div>
          </div>
        )}
      </div>

      {/* USP 카드 영역 */}
      {extractedUSPs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">추출된 USP</h3>
            <Button variant="outline" size="sm" onClick={handleAddUSP}>
              + USP 추가
            </Button>
          </div>

          <div className="grid gap-3">
            {extractedUSPs.map((usp) => (
              <Card key={usp.id} variant="bordered" padding="md">
                {editingUSP === usp.id ? (
                  <div className="space-y-3">
                    <input
                      value={newUSPTitle}
                      onChange={(e) => setNewUSPTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="USP 제목"
                    />
                    <textarea
                      value={newUSPDesc}
                      onChange={(e) => setNewUSPDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={2}
                      placeholder="USP 설명"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setEditingUSP(null)}>
                        취소
                      </Button>
                      <Button size="sm" onClick={() => handleSaveUSP(usp.id)}>
                        저장
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{usp.icon || '📌'}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{usp.title}</h4>
                        <p className="text-sm text-gray-600 mt-0.5">{usp.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEditUSP(usp)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        title="수정"
                      >
                        &#9998;
                      </button>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_USP', payload: usp.id })}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="삭제"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* 다음 버튼 */}
          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>
              이전
            </Button>
            <Button size="lg" onClick={handleNext}>
              다음: 톤앤매너 선택
            </Button>
          </div>
        </motion.div>
      )}

      {/* 추출 중 로딩 */}
      {isExtracting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary-50 text-primary-700">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            USP를 분석하고 있습니다...
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
