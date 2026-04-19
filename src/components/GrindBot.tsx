import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, PlusCircle } from 'lucide-react';
import { getAIBuddyResponse } from '../lib/gemini';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { addRoadmapToUser } from '../lib/db';

interface GrindBotProps {
  user: any;
}

export const GrindBot: React.FC<GrindBotProps> = ({ user }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'STATION ENGAGED. I AM GRINDBOT. STATUS REPORT REQUIRED. WHAT ARE WE CONQUERING TODAY?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    const newMessages = [...messages, { role: 'user', text: userMsg.toUpperCase() }];
    setMessages(newMessages);
    setIsLoading(true);

    const response = await getAIBuddyResponse(user?.stats || {}, userMsg, messages);
    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setIsLoading(false);
  };

  const parseRoadmap = (text: string) => {
    if (!text.includes('### ROADMAP:')) return null;
    try {
      const titleMatch = text.match(/### ROADMAP: (.*)/);
      const title = titleMatch ? titleMatch[1] : 'New Roadmap';
      
      const lines = text.split('\n');
      const modules: any[] = [];
      let description = '';

      lines.forEach(line => {
        if (line.startsWith('- Module')) {
          const modName = line.split(': ')[1];
          if (modName) {
            modules.push({ 
              name: modName, 
              status: modules.length === 0 ? 'current' : 'locked' 
            });
          }
        } else if (!line.startsWith('#') && line.trim() && modules.length === 0) {
          description = line.trim();
        }
      });

      return { title, description, modules, progress: 0 };
    } catch (e) {
      return null;
    }
  };

  const handleAddRoadmap = async (roadmap: any) => {
    if (!user) return;
    try {
      await addRoadmapToUser(user.uid, roadmap);
      setMessages(prev => [...prev, { role: 'assistant', text: 'ROADMAP INTEGRATED INTO YOUR NEURAL ARCHITECTURE. GO TO THE ROADMAPS SECTION TO BEGIN.' }]);
    } catch (error) {
      console.error("Failed to add roadmap:", error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-6xl mx-auto py-6">
      <div className="flex items-center space-x-6 mb-12 border-b border-[var(--tech-border)] pb-8">
        <div className="w-16 h-16 bg-black border border-[var(--tech-border)] flex items-center justify-center text-[var(--tech-accent)] tech-panel relative">
          <Bot size={28} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--tech-accent)] rounded-full tech-pulse shadow-[0_0_10px_var(--tech-glow)]"></div>
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white mb-1 uppercase italic">Neural_Consultant</h2>
          <p className="font-mono text-[9px] font-bold uppercase text-[var(--tech-text-dim)] tracking-[0.4em]">Biometric Architecture // VERSION 2.0.4 // ONLINE</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 tech-indent border-transparent overflow-y-auto p-10 space-y-10 mb-8 custom-scrollbar bg-[var(--tech-indent-bg)]"
      >
        {messages.map((msg, i) => {
          const roadmap = msg.role === 'assistant' ? parseRoadmap(msg.text) : null;
          
          return (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] tech-panel p-8 border-[var(--tech-border)] ${
                msg.role === 'user' 
                  ? 'bg-black/40 text-[var(--tech-text-dim)]' 
                  : 'bg-[var(--tech-inner)] text-[var(--tech-accent)]'
              }`}>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--tech-border)]">
                  <div className="flex items-center space-x-3">
                    {msg.role === 'user' ? <User size={12} className="text-zinc-600" /> : <Zap size={12} className="text-[var(--tech-accent)]" />}
                    <span className="text-[9px] font-black tracking-[0.3em] uppercase text-zinc-600 italic">
                      {msg.role === 'user' ? 'OPERATOR' : 'INTELLIGENCE'}
                    </span>
                  </div>
                  {roadmap && (
                    <button 
                      onClick={() => handleAddRoadmap(roadmap)}
                      className="tech-btn tech-btn-active text-[8px] font-black px-4 py-1.5"
                    >
                      <PlusCircle size={10} className="mr-2" />
                      <span>INTEGRATE_ROADMAP</span>
                    </button>
                  )}
                </div>
                <div className="prose prose-invert prose-xs max-w-none text-[11px] font-black uppercase tracking-widest leading-relaxed prose-p:text-[var(--tech-text)] prose-headings:text-[var(--tech-accent)] prose-li:text-[var(--tech-text-dim)] prose-strong:text-[var(--tech-accent)]">
                  <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="tech-panel p-8 bg-[var(--tech-inner)] border-[var(--tech-border)] tech-pulse">
              <span className="text-[9px] font-black tracking-[0.4em] uppercase text-[var(--tech-accent)] opacity-50 italic">Synthesizing_Neural_Directives...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex space-x-4">
        <div className="flex-1 tech-indent p-1">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="CONVERSE_WITH_ARCHITECTURE..."
            className="w-full bg-transparent border-none p-5 text-[11px] font-black uppercase tracking-widest text-[var(--tech-accent)] placeholder:text-zinc-800 outline-none transition-all"
          />
        </div>
        <button 
          disabled={isLoading}
          className="tech-btn tech-btn-active p-6 px-10 shadow-none disabled:opacity-30"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
