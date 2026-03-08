'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { AnalyzeResponse } from '@/lib/types';

interface ChatAssistantProps {
  productContext: AnalyzeResponse | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatAssistant({ productContext }: ChatAssistantProps) {
  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! Ask me anything about this product — nutrition, risks, ingredients, or alternatives.' }
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, productContext }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer ?? 'No response.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to connect. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 text-black shadow-glow flex items-center justify-center"
        aria-label="Open chat assistant"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <X size={22} strokeWidth={2.5} />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}>
              <MessageSquare size={22} strokeWidth={2.5} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[480px] glass rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-white/10"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Bot size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">NutriScan Assistant</p>
                <p className="text-slate-600 text-xs">Ask about this product</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      msg.role === 'assistant' ? 'bg-green-500/20' : 'bg-blue-500/20'
                    }`}
                  >
                    {msg.role === 'assistant'
                      ? <Bot size={12} className="text-green-400" />
                      : <User size={12} className="text-blue-400" />
                    }
                  </div>
                  <div
                    className={`px-3.5 py-2.5 rounded-xl text-sm max-w-[85%] leading-relaxed ${
                      msg.role === 'assistant'
                        ? 'bg-white/5 text-slate-300'
                        : 'bg-green-500/15 text-green-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Bot size={12} className="text-green-400" />
                  </div>
                  <div className="px-3.5 py-2.5 rounded-xl bg-white/5 flex items-center gap-2">
                    <Loader2 size={13} className="text-slate-400 animate-spin" />
                    <span className="text-slate-500 text-xs">Thinking…</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5">
              <div className="flex items-end gap-2 bg-white/5 rounded-xl px-3 py-2.5">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask a question…"
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 resize-none outline-none max-h-24"
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-lg bg-green-500 text-black flex items-center justify-center flex-shrink-0 disabled:opacity-30 hover:bg-green-400 transition-colors"
                >
                  <Send size={14} strokeWidth={2.5} />
                </button>
              </div>
              <p className="text-xs text-slate-700 text-center mt-2">Powered by Gemini AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
