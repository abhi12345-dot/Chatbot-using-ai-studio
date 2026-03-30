import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, ChatSession } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatAreaProps {
  currentSession: ChatSession | undefined;
  setInput: (input: string) => void;
}

const MessageItem = React.memo(({ message }: { message: Message }) => {
  return (
    <div 
      className={cn(
        "flex gap-4 group",
        message.role === 'user' ? "justify-end" : "justify-start"
      )}
    >
      {message.role === 'model' && (
        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
          <Bot size={18} className="text-white" />
        </div>
      )}
      
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
        message.role === 'user' 
          ? "bg-[#2f2f2f] text-white" 
          : "bg-transparent text-gray-100"
      )}>
        {message.role === 'model' ? (
          <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#171717] prose-pre:border prose-pre:border-white/10">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ) : (
          message.content
        )}
      </div>

      {message.role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
          <User size={18} className="text-white" />
        </div>
      )}
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

export const ChatArea = ({ currentSession, setInput }: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages.length, currentSession?.messages[currentSession.messages.length - 1]?.content]);

  if (!currentSession || currentSession.messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6"
        >
          <Bot size={32} className="text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold mb-2">How can I help you today?</h1>
        <p className="text-gray-400 max-w-md">
          Start a new conversation or select a recent chat from the sidebar.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-12 w-full max-w-2xl">
          {[
            "Explain quantum computing in simple terms",
            "Write a Python script to scrape a website",
            "Plan a 3-day trip to Tokyo",
            "How do I make a perfect sourdough bread?"
          ].map((suggestion, i) => (
            <button
              key={i}
              onClick={() => setInput(suggestion)}
              className="p-4 text-left rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm text-gray-300"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
        {currentSession.messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
