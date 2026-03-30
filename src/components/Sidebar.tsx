import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, MessageSquare, Trash2, Settings, X } from 'lucide-react';
import { ChatSession } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  createNewChat: () => void;
  setCurrentSessionId: (id: string) => void;
  deleteSession: (id: string, e: React.MouseEvent) => void;
}

const SidebarItem = React.memo(({ 
  session, 
  isActive, 
  onClick, 
  onDelete 
}: { 
  session: ChatSession; 
  isActive: boolean; 
  onClick: () => void; 
  onDelete: (id: string, e: React.MouseEvent) => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full group flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-all relative",
        isActive ? "bg-[#2f2f2f]" : "hover:bg-[#2f2f2f]"
      )}
    >
      <MessageSquare size={16} className="text-gray-400" />
      <span className="flex-1 text-left truncate pr-6">{session.title}</span>
      <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Trash2 
          size={14} 
          className="text-gray-500 hover:text-red-400" 
          onClick={(e) => onDelete(session.id, e)}
        />
      </div>
    </button>
  );
});

SidebarItem.displayName = 'SidebarItem';

export const Sidebar = ({
  sessions,
  currentSessionId,
  isSidebarOpen,
  setIsSidebarOpen,
  createNewChat,
  setCurrentSessionId,
  deleteSession
}: SidebarProps) => {
  return (
    <AnimatePresence mode="wait">
      {isSidebarOpen && (
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="fixed md:relative z-40 w-[260px] h-full bg-[#171717] flex flex-col border-r border-white/10"
        >
          <div className="p-3">
            <button
              onClick={createNewChat}
              className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg border border-white/20 hover:bg-white/5 transition-colors"
            >
              <Plus size={16} />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-2 custom-scrollbar">
            <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wider">
              Recent Chats
            </div>
            {sessions.map((session) => (
              <SidebarItem
                key={session.id}
                session={session}
                isActive={currentSessionId === session.id}
                onClick={() => {
                  setCurrentSessionId(session.id);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                onDelete={deleteSession}
              />
            ))}
          </div>

          <div className="p-3 border-t border-white/10">
            <button className="w-full flex items-center gap-3 px-3 py-3 text-sm rounded-lg hover:bg-[#2f2f2f] transition-colors">
              <Settings size={16} />
              Settings
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
