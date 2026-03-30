import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronDown, Sparkles } from 'lucide-react';
import { MODELS, ModelType } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
  isModelDropdownOpen: boolean;
  setIsModelDropdownOpen: (open: boolean) => void;
}

export const Header = ({
  isSidebarOpen,
  setIsSidebarOpen,
  selectedModel,
  setSelectedModel,
  isModelDropdownOpen,
  setIsModelDropdownOpen
}: HeaderProps) => {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-[#212121]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors text-sm font-semibold"
          >
            {MODELS.find(m => m.id === selectedModel)?.name}
            <ChevronDown size={14} className={cn("transition-transform", isModelDropdownOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {isModelDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 mt-2 w-64 bg-[#2f2f2f] border border-white/10 rounded-xl shadow-2xl p-2 z-50"
              >
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id as ModelType);
                      setIsModelDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex flex-col gap-0.5 p-3 rounded-lg text-left transition-colors",
                      selectedModel === model.id ? "bg-white/10" : "hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{model.name}</span>
                      {selectedModel === model.id && <Sparkles size={14} className="text-yellow-400" />}
                    </div>
                    <span className="text-xs text-gray-400">{model.description}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
