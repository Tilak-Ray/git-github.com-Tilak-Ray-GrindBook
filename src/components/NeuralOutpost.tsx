import React, { useState, useMemo } from 'react';
import { Box, Hammer, Info, Trash2, Shield, Zap, Flame, Terminal, Plus, ArrowUp, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateBaseLayout } from '../lib/db';

interface NeuralOutpostProps {
  user: any;
}

type BlockType = 'steel' | 'carbon' | 'neon';

interface Node {
  id: number;
  type: BlockType | null;
  height: number;
}

export const NeuralOutpost: React.FC<NeuralOutpostProps> = ({ user }) => {
  const [selectedBlock, setSelectedBlock] = useState<BlockType>('steel');
  const [isPlacing, setIsPlacing] = useState(true);
  
  const inventory = {
    steel: user?.inventory?.steel || 0,
    carbon: user?.inventory?.carbon || 0,
    neon: user?.inventory?.neon || 0,
  };

  const initialLayout = user?.outpost?.layout || Array.from({ length: 36 }, (_, i) => ({ id: i, type: null, height: 0 }));
  const [layout, setLayout] = useState<Node[]>(initialLayout);

  const handleCellClick = async (id: number) => {
    if (!isPlacing) return;
    
    const newLayout = [...layout];
    const node = newLayout[id];

    if (node.type === null) {
      if (inventory[selectedBlock] > 0) {
        node.type = selectedBlock;
        node.height = 1;
        // Optimization: In a real app we'd decrement local inventory or wait for DB sync
      }
    } else if (node.type === selectedBlock && node.height < 3) {
      if (inventory[selectedBlock] > 0) {
        node.height += 1;
      }
    } else {
      node.type = null;
      node.height = 0;
    }

    setLayout(newLayout);
    if (user?.uid) {
      await updateBaseLayout(user.uid, newLayout);
    }
  };

  const stats = useMemo(() => {
    const totalHeight = layout.reduce((acc, curr) => acc + curr.height, 0);
    const complexNodes = layout.filter(n => n.height > 1).length;
    return { totalHeight, complexNodes };
  }, [layout]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-[var(--tech-border)] pb-10">
        <div className="flex-1">
          <h2 className="text-3xl font-black text-[var(--tech-text-bright)] tracking-tighter uppercase italic mb-2">Architectural_Baseline</h2>
          <p className="text-[10px] font-mono text-[var(--tech-text-dim)] uppercase tracking-[0.4em]">Constructing high-performance outpost from tactical materials.</p>
        </div>
        <div className="flex items-center space-x-6 shrink-0">
           <div className="flex items-center space-x-2 bg-[var(--tech-inner)] border border-[var(--tech-border)] p-1 shadow-inner">
              {(['steel', 'carbon', 'neon'] as const).map((type) => (
                <button 
                  key={type}
                  onClick={() => setSelectedBlock(type)}
                  className={`px-4 py-2 flex flex-col items-center space-y-1 border transition-all ${
                    selectedBlock === type 
                      ? 'border-[var(--tech-accent)] bg-[var(--tech-accent)]/10' 
                      : 'border-transparent text-[var(--tech-text-dim)] hover:text-white'
                  }`}
                >
                  <Box size={14} className={selectedBlock === type ? 'text-[var(--tech-accent)]' : ''} />
                  <span className="text-[8px] font-mono font-black">{inventory[type]}</span>
                </button>
              ))}
           </div>
           
           <button 
            onClick={() => setIsPlacing(!isPlacing)}
            className={`tech-btn flex items-center space-x-3 px-8 py-3 ${isPlacing ? 'tech-btn-active' : 'text-[var(--tech-text-dim)]'}`}
           >
              {isPlacing ? <Hammer size={14} /> : <MousePointer2 size={14} />}
              <span className="text-[9px] font-black uppercase tracking-widest">{isPlacing ? 'CONSTRUCT' : 'INSPECT'}</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-8">
          <div className="tech-panel aspect-square md:aspect-video bg-[var(--tech-indent-bg)] border-[var(--tech-border)] relative overflow-hidden flex items-center justify-center p-12 cursor-crosshair">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(45deg, var(--tech-accent) 1px, transparent 1px), linear-gradient(-45deg, var(--tech-accent) 1px, transparent 1px)`, backgroundSize: '60px 60px' }}></div>
            
            {/* The Isometric Construction Grid */}
            <div className="relative transform rotateX-60 rotateZ-45 scale-75 md:scale-100 flex items-center justify-center transition-all duration-1000" style={{ transform: 'rotateX(60deg) rotateZ(-45deg)' }}>
               <div className="grid grid-cols-6 gap-2">
                 {layout.map((node) => (
                   <div 
                    key={node.id} 
                    onClick={() => handleCellClick(node.id)}
                    className={`w-12 md:w-16 h-12 md:h-16 border transition-all duration-300 relative group overflow-visible ${node.type ? 'border-[var(--tech-accent)]/40 bg-[var(--tech-accent)]/5' : 'border-[var(--tech-border)]/20 bg-black/5 hover:border-[var(--tech-accent)]/30'}`}
                   >
                     {/* 3D Stack Visualization */}
                     {node.type && Array.from({ length: node.height }).map((_, h) => (
                        <div 
                          key={h}
                          style={{ transform: `translateZ(${h * 20}px)` }}
                          className="absolute inset-0 flex items-center justify-center z-10 transition-transform duration-500"
                        >
                           {/* Isometric Faces */}
                           <div className={`absolute inset-0 border ${
                             node.type === 'carbon' ? 'bg-zinc-900 border-zinc-700' : node.type === 'neon' ? 'bg-[var(--tech-accent)]/20 border-[var(--tech-accent)]' : 'bg-zinc-800 border-zinc-600'
                           }`}></div>
                           <div className={`absolute bottom-full left-0 right-0 h-4 md:h-6 origin-bottom skew-x-[45deg] border-l border-t ${
                             node.type === 'carbon' ? 'bg-zinc-800 border-zinc-700' : node.type === 'neon' ? 'bg-[var(--tech-accent)]/40 border-[var(--tech-accent)]' : 'bg-zinc-700 border-zinc-600'
                           }`}></div>
                           <div className={`absolute top-0 bottom-0 left-full w-4 md:w-6 origin-left skew-y-[45deg] border-r border-t ${
                             node.type === 'carbon' ? 'bg-zinc-700 border-zinc-600' : node.type === 'neon' ? 'bg-[var(--tech-accent)]/30 border-[var(--tech-accent)]' : 'bg-zinc-600 border-zinc-500'
                           }`}></div>
                        </div>
                     ))}
                     
                     {/* Blueprint Preview */}
                     {isPlacing && !node.type && (
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={16} className="text-[var(--tech-accent)] animate-pulse" />
                       </div>
                     )}
                   </div>
                 ))}
               </div>
            </div>

            <div className="absolute top-8 left-8 flex items-center space-x-6 text-[8px] font-mono text-[var(--tech-text-dim)] uppercase tracking-widest bg-black/40 backdrop-blur-md p-3 border border-white/5">
               <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-[var(--tech-accent)] rounded-full tech-pulse"></span>
                  <span>SYNC_ACTIVE</span>
               </div>
               <span>COMPLEXITY: {Math.round((stats.totalHeight / 108) * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="tech-panel p-6 bg-[var(--tech-inner)] border-[var(--tech-border)] space-y-6">
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--tech-accent)] tech-glow-text mb-4 italic flex items-center justify-between">
                <span>Architecture_OS</span>
                <Terminal size={12} />
              </h3>
              
              <div className="space-y-4">
                 <div className="p-4 tech-indent bg-black/20 flex flex-col items-center justify-center border-transparent transition-all hover:bg-black/30">
                    <span className="text-[7px] font-black text-[var(--tech-text-dim)] uppercase tracking-[0.2em] mb-1">Structural_Integrity</span>
                    <span className="text-xl font-black text-[var(--tech-text-bright)] italic">{stats.totalHeight}u</span>
                 </div>
                 <div className="p-4 tech-indent bg-black/20 flex flex-col items-center justify-center border-transparent transition-all hover:bg-black/30">
                    <span className="text-[7px] font-black text-[var(--tech-text-dim)] uppercase tracking-[0.2em] mb-1">Nodes_Established</span>
                    <span className="text-xl font-black text-[var(--tech-text-bright)] italic">{layout.filter(n => n.type).length}</span>
                 </div>
              </div>

              <div className="pt-6 border-t border-[var(--tech-border)] space-y-2">
                 <p className="text-[7px] font-mono text-[var(--tech-text-dim)] uppercase tracking-widest mb-3">Construction_Tips</p>
                 <div className="flex items-start space-x-3 text-[8px] text-[var(--tech-text-dim)] uppercase leading-relaxed">
                    <Info size={12} className="text-[var(--tech-accent)] shrink-0" />
                    <span>Stack blocks of the same type to increase height and structure density.</span>
                 </div>
              </div>
           </div>

           <div className="tech-panel p-6 bg-[var(--tech-indent-bg)] border-[var(--tech-border)] relative overflow-hidden group">
              <div className="flex items-center space-x-3 mb-6">
                 <ArrowUp size={16} className="text-[var(--tech-accent)]" />
                 <h4 className="text-[9px] font-black text-white uppercase italic tracking-widest">Base_Capabilities</h4>
              </div>
              <ul className="space-y-4 text-[7px] font-black text-[var(--tech-text-dim)] uppercase tracking-widest">
                 <li className="flex items-center space-x-2"><div className="w-1 h-1 bg-[var(--tech-accent)]"></div> <span>LVL 10: Multi-Floor Tech</span></li>
                 <li className="flex items-center space-x-2 opacity-30"><div className="w-1 h-1 bg-zinc-800"></div> <span>LVL 25: Bio-Dome Protocol</span></li>
                 <li className="flex items-center space-x-2 opacity-30"><div className="w-1 h-1 bg-zinc-800"></div> <span>LVL 50: Orbital Array</span></li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
};
