import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatArea } from './components/ChatArea';
import { InputArea } from './components/InputArea';
import { Message, ChatSession, MODELS, ModelType } from './types';
import { getChatResponseStream } from './services/gemini';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelType>(MODELS[0].id as ModelType);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // Load sessions from local storage once
  useEffect(() => {
    const saved = localStorage.getItem('chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to parse saved sessions', e);
      }
    }
  }, []);

  // Save sessions to local storage - debounced or throttled would be better, but let's keep it simple for now
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const currentSession = useMemo(() => 
    sessions.find(s => s.id === currentSessionId),
    [sessions, currentSessionId]
  );

  const createNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      model: selectedModel,
      createdAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, [selectedModel]);

  const deleteSession = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      if (currentSessionId === id) {
        setCurrentSessionId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  }, [currentSessionId]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    let sessionId = currentSessionId;
    
    // Create new session if none exists
    if (!sessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : ''),
        messages: [],
        model: selectedModel,
        createdAt: Date.now()
      };
      sessionId = newSession.id;
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(sessionId);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };

    // Add user message and update title if needed
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const title = s.messages.length === 0 ? userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '') : s.title;
        return { ...s, messages: [...s.messages, userMsg], title };
      }
      return s;
    }));

    try {
      const assistantMsgId = (Date.now() + 1).toString();
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'model',
        content: '',
        timestamp: Date.now()
      };

      // Add empty assistant message
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s
      ));

      let fullContent = '';
      let lastUpdateTime = Date.now();
      const stream = getChatResponseStream(selectedModel, currentSession?.messages || [], userMessage);

      for await (const chunk of stream) {
        fullContent += chunk;
        const now = Date.now();
        
        // Throttle updates to every 50ms to keep UI smooth but reduce re-renders
        if (now - lastUpdateTime > 50) {
          setSessions(prev => prev.map(s => 
            s.id === sessionId ? {
              ...s,
              messages: s.messages.map(m => 
                m.id === assistantMsgId ? { ...m, content: fullContent } : m
              )
            } : s
          ));
          lastUpdateTime = now;
        }
      }

      // Final update to ensure we have the complete content
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? {
          ...s,
          messages: s.messages.map(m => 
            m.id === assistantMsgId ? { ...m, content: fullContent } : m
          )
        } : s
      ));
    } catch (error) {
      console.error('Chat error:', error);
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? {
          ...s,
          messages: [...s.messages, {
            id: 'error-' + Date.now(),
            role: 'model',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: Date.now()
          }]
        } : s
      ));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, currentSessionId, selectedModel, currentSession]);

  return (
    <div className="flex h-screen bg-[#212121] text-gray-100 overflow-hidden font-sans">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        createNewChat={createNewChat}
        setCurrentSessionId={setCurrentSessionId}
        deleteSession={deleteSession}
      />

      <main className="flex-1 flex flex-col relative min-w-0">
        <Header 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          isModelDropdownOpen={isModelDropdownOpen}
          setIsModelDropdownOpen={setIsModelDropdownOpen}
        />

        <ChatArea 
          currentSession={currentSession}
          setInput={setInput}
        />

        <InputArea 
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          isLoading={isLoading}
        />
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .prose pre {
          padding: 1rem;
          border-radius: 0.75rem;
          margin: 1rem 0;
          overflow-x: auto;
        }
        .prose code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9em;
        }
        .prose p {
          margin-bottom: 1rem;
        }
        .prose ul, .prose ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .prose li {
          margin-bottom: 0.5rem;
        }
      `}} />
    </div>
  );
}

