import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX, Shield, Zap, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Signal {
  id: string;
  author: string;
  content: string;
  videoUrl: string;
  likes: number;
  comments: number;
  tag: string;
}

const DUMMY_SIGNALS: Signal[] = [
  {
    id: '1',
    author: 'Operator_Zero',
    content: 'Neural synchronization successful. 12 hours of deep focus achieved. Protocol: Architecture.',
    videoUrl: 'https://picsum.photos/seed/focus1/1080/1920',
    likes: 1240,
    comments: 89,
    tag: '#DEEP_WORK'
  },
  {
    id: '2',
    author: 'Arch_Vibe',
    content: 'Building the foundation for the next sprint. Hardware optimization complete.',
    videoUrl: 'https://picsum.photos/seed/focus2/1080/1920',
    likes: 856,
    comments: 42,
    tag: '#ARCHITECTURE'
  },
  {
    id: '3',
    author: 'Quantum_Grind',
    content: 'The signal is clear. Motivation is a byproduct of motion. Keep grinding.',
    videoUrl: 'https://picsum.photos/seed/focus3/1080/1920',
    likes: 2105,
    comments: 156,
    tag: '#MINDSET'
  }
];

export const SignalFeed: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] w-full flex justify-center bg-black overflow-hidden relative">
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full max-w-[450px] overflow-y-scroll snap-y snap-mandatory custom-scrollbar-none"
      >
        {DUMMY_SIGNALS.map((signal, index) => (
          <div key={signal.id} className="h-full w-full snap-start relative bg-zinc-900 border-x border-[var(--tech-border)]">
            {/* Video Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-10"></div>
            <img 
              src={signal.videoUrl} 
              alt="Signal content" 
              className="h-full w-full object-cover grayscale brightness-75 transition-all duration-700"
              referrerPolicy="no-referrer"
            />

            {/* UI Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-8 z-20 space-y-6">
              <div className="flex items-end justify-between">
                <div className="flex-1 pr-12">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-black border-2 border-[var(--tech-accent)] p-0.5 tech-panel">
                       <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                          <Shield size={16} className="text-[var(--tech-accent)]" />
                       </div>
                    </div>
                    <div>
                      <h4 className="font-black text-[13px] text-white uppercase italic tracking-tighter flex items-center space-x-2">
                        <span>{signal.author}</span>
                        <Zap size={10} className="text-[var(--tech-accent)] fill-[var(--tech-accent)]" />
                      </h4>
                      <p className="text-[8px] font-mono text-[var(--tech-accent)] font-bold tracking-widest">{signal.tag}</p>
                    </div>
                  </div>
                  <p className="text-[12px] font-black text-white/90 leading-relaxed uppercase tracking-wide line-clamp-3 italic">
                    {signal.content}
                  </p>
                </div>

                <div className="flex flex-col items-center space-y-8 pb-4">
                  <button className="flex flex-col items-center space-y-1">
                    <div className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:text-[var(--tech-accent)] transition-all">
                      <Heart size={24} className={index === 0 ? "fill-[var(--tech-accent)] text-[var(--tech-accent)]" : ""} />
                    </div>
                    <span className="text-[10px] font-black font-mono text-white/60">{signal.likes}</span>
                  </button>
                  <button className="flex flex-col items-center space-y-1">
                    <div className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:text-[var(--tech-accent)] transition-all">
                      <MessageCircle size={24} />
                    </div>
                    <span className="text-[10px] font-black font-mono text-white/60">{signal.comments}</span>
                  </button>
                  <button className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:text-[var(--tech-accent)] transition-all">
                    <Share2 size={24} />
                  </button>
                </div>
              </div>
              
              <div className="h-0.5 w-full bg-white/10 overflow-hidden">
                <motion.div 
                  className="h-full bg-[var(--tech-accent)]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                ></motion.div>
              </div>
            </div>

            {/* Status Icons */}
            <div className="absolute top-8 right-8 z-30 flex flex-col space-y-4">
               <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white/40 hover:text-white transition-all border border-white/5"
               >
                 {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
               </button>
            </div>
            
            <div className="absolute top-8 left-8 z-30">
               <div className="flex items-center space-x-2 px-3 py-1 bg-black/40 backdrop-blur-md border border-[var(--tech-accent)]/30">
                  <div className="w-1.5 h-1.5 bg-[var(--tech-accent)] rounded-full tech-pulse"></div>
                  <span className="text-[8px] font-black text-[var(--tech-accent)] uppercase tracking-widest italic">LIVE_SIGNAL</span>
               </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Side Decoration */}
      <div className="hidden xl:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col space-y-12 items-center text-zinc-800">
         <div className="flex flex-col items-center space-y-2">
            <p className="[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-[0.8em]">SIGNAL_DENSITY</p>
            <div className="w-px h-32 bg-zinc-900 relative">
               <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-4 h-4 border border-zinc-800 rotate-45"></div>
            </div>
         </div>
      </div>
    </div>
  );
};
