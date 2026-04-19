import React, { useMemo } from 'react';
import { Activity, Shield, Box, Target } from 'lucide-react';

interface WorldGridProps {
  user: any;
}

export const WorldGrid: React.FC<WorldGridProps> = ({ user }) => {
  const level = user?.stats?.level || 1;
  const tasksCompleted = user?.stats?.tasksCompleted || 0;
  const streak = user?.stats?.streak || 1;

  const calendarData = useMemo(() => {
    const cols = 20; 
    const rows = 7;
    const data = [];
    
    for (let i = 0; i < cols * rows; i++) {
      const isRecent = i > (cols * rows) - streak;
      const intensity = isRecent 
        ? 0.4 + (Math.random() * 0.6) 
        : Math.random() > 0.8 ? Math.random() * 0.3 : 0;
      
      data.push({
        id: i,
        intensity: intensity,
        active: intensity > 0
      });
    }
    return data;
  }, [streak, tasksCompleted]);

  return (
    <div className="flex flex-col h-full space-y-6 py-4 overflow-hidden">
      <div className="flex items-end justify-between border-b border-[var(--tech-border)] pb-6 min-w-0">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
           <Activity size={18} className="text-[var(--tech-accent)] shrink-0" />
           <div className="min-w-0 flex-1">
              <h2 className="text-[10px] font-black text-[var(--tech-accent)] uppercase tracking-[0.4em] tech-glow-text truncate">Progression_Telemetry</h2>
              <p className="text-[8px] font-mono text-[var(--tech-text-dim)] uppercase tracking-widest mt-1 truncate">Real-time sync established.</p>
           </div>
        </div>
        <div className="text-right shrink-0 ml-4">
           <p className="text-2xl font-black text-[var(--tech-text-bright)] leading-none tracking-tighter italic">{streak}</p>
           <p className="text-[7px] font-mono text-[var(--tech-text-dim)] uppercase tracking-[0.2em] mt-1">CONSECUTIVE_DAYS</p>
        </div>
      </div>

      <div className="tech-panel p-6 bg-[var(--tech-indent-bg)] relative overflow-hidden flex flex-col justify-center border-[var(--tech-border)]">
        <div className="absolute top-0 right-0 p-2 opacity-10">
           <Shield size={64} className="text-[var(--tech-accent)]" />
        </div>

        <div className="grid grid-cols-20 gap-1.5 h-32 w-full mx-auto relative z-10">
          {calendarData.map((cell) => (
            <div 
              key={cell.id} 
              className={`aspect-square rounded-[1px] transition-all duration-700 ${cell.active ? 'bg-[var(--tech-accent)]' : 'bg-black/20'}`}
              style={{ 
                opacity: cell.active ? 0.2 + cell.intensity * 0.8 : 0.05,
                boxShadow: cell.active && cell.intensity > 0.8 ? '0 0 10px var(--tech-glow)' : 'none'
              }}
            ></div>
          ))}
        </div>
        
        <div className="mt-8 flex items-center justify-between text-[8px] font-mono text-[var(--tech-text-dim)] uppercase tracking-[0.2em]">
           <div className="flex items-center space-x-3">
              <span>INTEGRITY</span>
              <div className="flex space-x-1">
                 {[...Array(4)].map((_, i) => (
                   <div key={i} className={`w-2 h-2 rounded-[1px] ${i < 3 ? 'bg-[var(--tech-accent)]' : 'bg-black/20'}`} style={{ opacity: i === 2 ? 0.6 : 1 }}></div>
                 ))}
              </div>
           </div>
           <span className="tech-pulse">LOGGING_BUFFER... ACTIVE</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
         <div className="tech-panel p-4 bg-[var(--tech-inner)] border-[var(--tech-border)] flex flex-col items-center justify-center text-center">
            <span className="text-[7px] font-black text-[var(--tech-text-dim)] uppercase tracking-widest mb-1">Stability</span>
            <span className="text-[12px] font-black text-[var(--tech-accent)] tech-glow-text">98.4%</span>
         </div>
         <div className="tech-panel p-4 bg-[var(--tech-inner)] border-[var(--tech-border)] flex flex-col items-center justify-center text-center">
            <span className="text-[7px] font-black text-[var(--tech-text-dim)] uppercase tracking-widest mb-1">Focus_Index</span>
            <span className="text-[12px] font-black text-[var(--tech-text-bright)] italic underline decoration-[var(--tech-accent)]/30">ALPHA</span>
         </div>
         <div className="tech-panel p-4 bg-[var(--tech-inner)] border-[var(--tech-border)] flex flex-col items-center justify-center text-center">
            <span className="text-[7px] font-black text-[var(--tech-text-dim)] uppercase tracking-widest mb-1">Atmosphere</span>
            <span className="text-[12px] font-black text-[var(--tech-text-dim)]">NOMINAL</span>
         </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
         <div className="tech-panel p-5 bg-[var(--tech-inner)] border-[var(--tech-border)]">
            <div className="flex items-center space-x-2 mb-2">
               <Box size={10} className="text-[var(--tech-accent)]" />
               <p className="text-[7px] font-black text-[var(--tech-text-dim)] uppercase tracking-widest">Neural_Density</p>
            </div>
            <p className="text-xl font-black text-[var(--tech-text-bright)] italic tracking-tighter">{(tasksCompleted / 100).toFixed(2)}%</p>
            <div className="h-0.5 w-full bg-black/10 mt-2">
               <div className="h-full bg-[var(--tech-accent)]" style={{ width: `${(tasksCompleted % 100)}%` }}></div>
            </div>
         </div>
         <div className="tech-panel p-5 bg-[var(--tech-inner)] border-[var(--tech-border)]">
            <div className="flex items-center space-x-2 mb-2">
               <Target size={10} className="text-[var(--tech-accent)]" />
               <p className="text-[7px] font-black text-[var(--tech-text-dim)] uppercase tracking-widest">Total_Sprints</p>
            </div>
            <p className="text-xl font-black text-[var(--tech-text-bright)] italic tracking-tighter">{tasksCompleted}</p>
            <p className="text-[7px] font-mono text-[var(--tech-text-dim)] mt-2">CYCLES_EXECUTED</p>
         </div>
      </div>
    </div>
  );
};
