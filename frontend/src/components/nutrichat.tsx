'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function NutriChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 3D Animated Trigger Button */}
      <ChatbotButton isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} />

      {/* Floating Chat Window Modal */}
      <AnimatePresence>
        {isOpen && <ChatWindow close={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function ChatbotButton({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) {
  return (
    <motion.button
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center outline-none"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle Nutri Chatbot"
    >
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-[#00ff99] blur-xl opacity-40"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* 3D Orb Body */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#67e8a3] via-[#00ff99] to-[#00b36b] shadow-[inset_-8px_-8px_16px_rgba(0,100,50,0.5),0_10px_20px_rgba(0,0,0,0.4)] overflow-hidden">
          {/* Inner Light Reflection */}
          <div className="absolute top-1 left-3 w-8 h-4 bg-white/40 rounded-full blur-[2px] transform -rotate-12" />
        </div>
        
        {/* Icon Inside */}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="z-10 text-green-950"
            >
              <X size={26} strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="z-10 text-green-950"
            >
              <Bot size={26} strokeWidth={2.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

function ChatWindow({ close }: { close: () => void }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I am Nutri, your AI Nutrition Assistant. Are you experiencing any discomfort, or do you need nutrition advice?' }
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // Mock AI response logic based on simple keywords
    setTimeout(() => {
      let aiResponse = "That's interesting. I can help you find healthier alternatives and track your nutrition better. What else would you like to know?";
      const lowerInput = userMessage.toLowerCase();
      
      if (lowerInput.includes('stomach') || lowerInput.includes('digestion') || lowerInput.includes('bloat')) {
        aiResponse = "Stomach discomfort or bloating can often be triggered by excessive sodium, hidden artificial sweeteners (like sucralose), or lack of fiber. Try scanning your recent meals to check for these ingredients!";
      } else if (lowerInput.includes('tired') || lowerInput.includes('energy') || lowerInput.includes('fatigue')) {
        aiResponse = "Energy dips are common after eating high glycemic index foods or processed sugars. You might want to look for foods rich in B-Vitamins and complex carbs instead.";
      } else if (lowerInput.includes('sugar') || lowerInput.includes('sweet')) {
        aiResponse = "Consuming too much added sugar can cause energy crashes and inflammation. NutriScan helps you flag hidden sugars automatically.";
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
      setLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30, originX: 1, originY: 1 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 30 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-28 right-6 z-50 w-80 sm:w-[380px] h-[520px] bg-[#0d1424]/90 backdrop-blur-xl rounded-3xl flex flex-col overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-gradient-to-r from-white/[0.05] to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ff99] to-[#00b36b] flex items-center justify-center shadow-lg">
            <Bot size={20} className="text-green-950" />
          </div>
          <div>
            <p className="text-white text-base font-semibold tracking-wide">Nutri</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#00ff99] animate-pulse" />
              <p className="text-[#00ff99]/70 text-xs tracking-wider">AI Nutrition Assistant</p>
            </div>
          </div>
        </div>
        <button onClick={close} className="text-white/40 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-[url('/noise.png')] bg-repeat bg-opacity-5">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-[#00ff99]/20 flex items-center justify-center flex-shrink-0 mb-1">
                <Bot size={12} className="text-[#00ff99]" />
              </div>
            )}
            <div
              className={`px-4 py-3 rounded-2xl text-[14px] max-w-[80%] leading-relaxed shadow-md ${
                msg.role === 'assistant'
                  ? 'bg-white/5 text-white/90 border border-white/5 rounded-bl-none'
                  : 'bg-gradient-to-br from-[#00ff99] to-[#00b36b] text-green-950 font-medium rounded-br-none'
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#00ff99]/20 flex items-center justify-center flex-shrink-0 mb-1">
              <Bot size={12} className="text-[#00ff99]" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 rounded-bl-none flex items-center gap-2">
              <Loader2 size={14} className="text-white/50 animate-spin" />
              <span className="text-white/50 text-xs">Nutri is thinking…</span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Field */}
      <div className="p-4 bg-white/[0.02] border-t border-white/5">
        <div className="flex items-end gap-2 bg-[#06080f]/50 border border-white/10 rounded-2xl px-3 py-2 focus-within:border-[#00ff99]/50 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your discomfort or symptoms..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 resize-none outline-none max-h-24 py-2 px-1"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-[#00ff99] text-green-950 flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:bg-white/10 hover:bg-[#67e8a3] transition-all duration-200 shadow-[0_0_15px_rgba(0,255,153,0.3)] disabled:shadow-none mb-0.5"
          >
            <Send size={16} strokeWidth={2.5} className="ml-0.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
