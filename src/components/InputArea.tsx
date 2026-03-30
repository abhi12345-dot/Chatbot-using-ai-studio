import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputAreaProps {
  input: string;
  setInput: (input: string) => void;
  handleSend: () => void;
  isLoading: boolean;
}

export const InputArea = ({ input, setInput, handleSend, isLoading }: InputAreaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="p-4 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent">
      <div className="max-w-3xl mx-auto relative">
        <div className="relative flex items-end bg-[#2f2f2f] rounded-2xl border border-white/10 focus-within:border-white/20 transition-all shadow-xl">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message Gemini..."
            className="w-full bg-transparent border-none focus:ring-0 resize-none py-4 px-4 max-h-60 text-[15px] custom-scrollbar"
            rows={1}
            style={{ height: 'auto', minHeight: '56px' }}
          />
          <div className="p-2">
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "p-2 rounded-xl transition-all",
                input.trim() && !isLoading 
                  ? "bg-white text-black hover:bg-gray-200" 
                  : "bg-white/5 text-gray-500 cursor-not-allowed"
              )}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <p className="text-[11px] text-center text-gray-500 mt-3">
          Gemini can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};
