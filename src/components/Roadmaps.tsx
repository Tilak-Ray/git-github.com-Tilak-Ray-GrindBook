import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, ChevronRight, Lock, Play, Zap } from 'lucide-react';
import { auth } from '../lib/firebase';
import { subscribeToUserRoadmaps, updateModuleStatus } from '../lib/db';

interface RoadmapsProps {
  userId: string;
}

export const Roadmaps: React.FC<RoadmapsProps> = ({ userId }) => {
  const [userRoadmaps, setUserRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeToUserRoadmaps(userId, (data) => {
      setUserRoadmaps(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  const handleUpdateModule = async (roadmapId: string, index: number, status: any) => {
    if (!userId) return;
    try {
      await updateModuleStatus(userId, roadmapId, index, status);
    } catch (error) {
      console.error("Failed to update module:", error);
    }
  };

  const getStatusAction = (modules: any[], index: number) => {
    const mod = modules[index];
    if (mod.status === 'completed') return 'DONE';
    if (mod.status === 'current') return 'COMPLETE';
    // If previous is completed, current can be started
    if (index > 0 && modules[index-1].status === 'completed') return 'START';
    if (index === 0) return 'START';
    return 'LOCKED';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-[var(--tech-border)] border-t-[var(--tech-accent)] rounded-full animate-spin"></div>
        <p className="text-[10px] font-mono text-[var(--tech-accent)] uppercase tracking-[0.4em] tech-pulse">COMPILING_PROTOCOLS...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[var(--tech-border)] pb-10">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-[var(--tech-text-bright)] mb-2 uppercase italic">Curated_Paths</h2>
          <p className="text-[var(--tech-text-dim)] font-mono text-[9px] font-bold uppercase tracking-[0.4em]">Structured evolution protocols for high-tier operators.</p>
        </div>
        <div className="flex space-x-4">
           <button className="tech-btn px-8 text-[var(--tech-text-dim)]">SUGGEST_PATH</button>
           <button className="tech-btn tech-btn-active px-8">BROWSE_GLOBAL</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {userRoadmaps.map((roadmap) => (
          <div key={roadmap.id} className="tech-panel p-10 flex flex-col group hover:border-[var(--tech-accent)]/30 transition-all duration-500 relative overflow-hidden bg-[var(--tech-inner)] border-[var(--tech-border)]">
            <div className="absolute -right-8 -top-8 text-[var(--tech-accent)] opacity-[0.02] group-hover:opacity-[0.05] transition-all">
              <BookOpen size={240} />
            </div>
            
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="w-16 h-16 bg-black border border-[var(--tech-border)] flex items-center justify-center text-[var(--tech-accent)] tech-panel group-hover:shadow-[0_0_20px_var(--tech-glow)] transition-all">
                <BookOpen size={28} />
              </div>
              <div className="tech-indent px-4 py-1.5 border-transparent">
                <span className="text-[10px] font-black text-[var(--tech-accent)] uppercase tracking-widest tech-glow-text">
                  {roadmap.progress === 100 ? 'COMPLETE' : `SYNC_${roadmap.progress}%`}
                </span>
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-[var(--tech-text-bright)] mb-4 relative z-10 uppercase italic tracking-tighter">{roadmap.title}</h3>
            <p className="text-[var(--tech-text-dim)] text-xs font-bold leading-relaxed mb-10 flex-1 relative z-10 uppercase tracking-widest leading-6">{roadmap.description}</p>

            <div className="space-y-4 mb-10 relative z-10 bg-black/10 p-6 tech-indent border-transparent">
               {roadmap.modules.map((mod: any, i: number) => {
                 const action = getStatusAction(roadmap.modules, i);
                 
                 return (
                  <div key={i} className="flex items-center justify-between group/mod border-b border-[var(--tech-border)]/30 pb-3 last:border-none last:pb-0">
                     <div className="flex items-center space-x-4">
                        {mod.status === 'completed' ? (
                          <div className="w-4 h-4 bg-[var(--tech-accent)]/20 border border-[var(--tech-accent)] flex items-center justify-center">
                            <CheckCircle size={10} className="text-[var(--tech-accent)]" />
                          </div>
                        ) : mod.status === 'current' ? (
                          <div className="w-4 h-4 border border-[var(--tech-accent)] flex items-center justify-center tech-pulse">
                             <div className="w-1.5 h-1.5 bg-[var(--tech-accent)] shadow-[0_0_8px_var(--tech-glow)]"></div>
                          </div>
                        ) : (
                          <Lock size={12} className="text-zinc-800" />
                        )}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${mod.status === 'locked' ? 'text-zinc-800' : mod.status === 'current' ? 'text-[var(--tech-text-bright)] italic' : 'text-[var(--tech-text-dim)]'}`}>
                          {mod.name}
                        </span>
                     </div>
                     
                     {action === 'START' || action === 'COMPLETE' ? (
                       <button 
                         onClick={() => handleUpdateModule(roadmap.id, i, action === 'START' ? 'current' : 'completed')}
                         className="text-[8px] font-black text-black bg-[var(--tech-accent)] px-3 py-1 hover:brightness-110 transition-all uppercase tracking-tighter"
                       >
                         {action}
                       </button>
                     ) : (
                       mod.status === 'current' && <ChevronRight size={14} className="text-[var(--tech-accent)] animate-pulse" />
                     )}
                  </div>
                )})}
            </div>

            <div className="pt-8 border-t border-[var(--tech-border)] mt-auto relative z-10">
               <div className="flex items-center justify-between mb-3 text-[9px] font-mono font-black uppercase tracking-[0.2em]">
                  <span className="text-zinc-700">Protocol_Integrity</span>
                  <span className="text-[var(--tech-accent)]">{roadmap.progress}%</span>
               </div>
               <div className="h-1 w-full bg-black rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-[var(--tech-accent)] shadow-[0_0_10px_var(--tech-glow)] transition-all duration-1000" style={{ width: `${roadmap.progress}%` }}></div>
               </div>
            </div>
          </div>
        ))}
        
        {userRoadmaps.length === 0 && (
          <div className="tech-panel p-20 flex flex-col items-center justify-center md:col-span-2 border-dashed border-[var(--tech-border)] bg-[var(--tech-indent-bg)] group hover:bg-[var(--tech-inner)] transition-all min-h-[400px]">
            <div className="w-20 h-20 bg-black border border-dashed border-[var(--tech-border)] flex items-center justify-center text-zinc-800 mb-8 group-hover:border-[var(--tech-accent)]/30 group-hover:text-[var(--tech-accent)]/30 transition-all tech-panel">
                <BookOpen size={40} />
            </div>
            <h4 className="text-[var(--tech-text-bright)] font-black mb-4 text-center text-2xl uppercase italic tracking-tighter">Architecture_Missing</h4>
            <p className="text-[var(--tech-text-dim)] text-[10px] text-center max-w-[400px] mb-10 uppercase font-bold tracking-[0.3em] leading-relaxed">Initiate conversation with Biometrics-AI to construct a roadmap based on your neural state and addiction patterns.</p>
            <button className="tech-btn tech-btn-active px-12">GENERATE_FIRST_PATH</button>
          </div>
        )}
      </div>
    </div>
  );
};
