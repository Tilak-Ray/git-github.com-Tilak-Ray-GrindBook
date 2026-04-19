import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, Headphones, Waves, Wind, Target, Settings2, ShieldCheck, Cpu, Timer, Volume2, VolumeX, Activity, Sparkles, Trees } from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESETS = [
  { id: 'tactical', label: 'TACTICAL_FOCUS', duration: 25, color: 'var(--tech-accent)' },
  { id: 'neural', label: 'NEURAL_REPAIR', duration: 45, color: '#3b82f6' },
  { id: 'rapid', label: 'RAPID_SYNC', duration: 10, color: '#f59e0b' }
];

const AMBIENT_SOUNDS = [
  { id: 'silence', label: 'NULL_STATE', icon: Waves, url: null },
  { id: 'rain', label: 'CYBER_RAIN', icon: Wind, url: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3' },
  { id: 'data', label: 'DATA_STREAM', icon: Headphones, url: 'white-noise' },
  { id: 'ambient', label: 'ARCH_ATMOS', icon: Cpu, url: 'brown-noise' },
  { id: 'nature', label: 'ZEN_GARDEN', icon: Trees, url: 'https://assets.mixkit.co/active_storage/sfx/1239/1239-preview.mp3' },
  { id: 'space', label: 'DEEP_SPACE', icon: Sparkles, url: 'deep-space' }
];

export const DeepFocus: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [activePreset, setActivePreset] = useState('tactical');
  const [activeSound, setActiveSound] = useState('silence');
  const [sessionGoal, setSessionGoal] = useState('');
  const [intensity, setIntensity] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const externalAudioRef = useRef<HTMLAudioElement | null>(null);

  // Audio Logic
  const stopAllAudio = () => {
    if (noiseSourceRef.current) {
      noiseSourceRef.current.stop();
      noiseSourceRef.current = null;
    }
    if (externalAudioRef.current) {
      externalAudioRef.current.pause();
      externalAudioRef.current.currentTime = 0;
    }
  };

  const updateAudioParameters = () => {
    if (!gainNodeRef.current || !filterRef.current) return;
    
    // Intensity affects Gain and Filter Frequency
    const baseGain = isMuted ? 0 : 0.1;
    const intensityFactor = intensity / 100;
    
    // Higher intensity = louder and more "submerged" (lower cutoff)
    gainNodeRef.current.gain.setTargetAtTime(baseGain + (intensityFactor * 0.1), audioCtxRef.current!.currentTime, 0.1);
    
    const cutoff = 2000 - (intensityFactor * 1500); // 2000Hz to 500Hz
    filterRef.current.frequency.setTargetAtTime(cutoff, audioCtxRef.current!.currentTime, 0.1);
  };

  const initSynthesizedNoise = (type: 'white' | 'brown' | 'space') => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      if (type === 'white') {
        output[i] = Math.random() * 2 - 1;
      } else {
        // Brown noise approximation
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; 
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    filterRef.current = filter;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;
    gainNodeRef.current = gainNode;
    
    source.connect(filter).connect(gainNode).connect(ctx.destination);
    source.start();
    noiseSourceRef.current = source;
    
    updateAudioParameters();
  };

  useEffect(() => {
    stopAllAudio();
    if (!isActive) return;

    const sound = AMBIENT_SOUNDS.find(s => s.id === activeSound);
    if (!sound || sound.id === 'silence') return;

    if (['white-noise', 'brown-noise', 'deep-space'].includes(sound.url || '')) {
      const type = sound.url === 'white-noise' ? 'white' : (sound.url === 'brown-noise' ? 'brown' : 'space');
      initSynthesizedNoise(type);
    } else if (sound.url) {
      const audio = new Audio(sound.url);
      audio.loop = true;
      audio.volume = isMuted ? 0 : 0.3 * (intensity / 100);
      audio.play().catch(e => console.error("Audio block:", e));
      externalAudioRef.current = audio;
    }

    return () => stopAllAudio();
  }, [activeSound, isActive, isMuted]);

  useEffect(() => {
    if (isActive) updateAudioParameters();
    if (externalAudioRef.current) {
        externalAudioRef.current.volume = isMuted ? 0 : 0.3 * (intensity / 100);
    }
  }, [intensity, isMuted]);

  // Timer Logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            handleCompletion();
          } else {
            setMinutes(prev => prev - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(prev => prev - 1);
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, seconds, minutes]);

  const handleCompletion = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00ff00', '#ffffff', '#000000']
    });
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    const preset = PRESETS.find(p => p.id === activePreset);
    setMinutes(preset?.duration || 25);
    setSeconds(0);
    setElapsedSeconds(0);
  };

  const selectPreset = (presetId: string) => {
    if (isActive) return;
    setActivePreset(presetId);
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      setMinutes(preset.duration);
      setSeconds(0);
      setElapsedSeconds(0);
    }
  };

  const totalPossibleSeconds = (PRESETS.find(p => p.id === activePreset)?.duration || 25) * 60;
  const progress = Math.min((elapsedSeconds / totalPossibleSeconds) * 100, 100);

  // Dynamic Styles
  const pulseSpeed = 10 / (intensity / 10 + 1); 
  const glowStrength = (intensity / 100) * 30;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-20 px-6 tech-grid-bg relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[var(--tech-accent)] opacity-[0.03] blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-red-500 opacity-[0.02] blur-[100px] rounded-full"></div>

      {/* Main Hardware Container */}
      <div className="relative w-full max-w-6xl tech-metal tech-corner-notch p-[1px] shadow-2xl">
        <div className="bg-[#1a1c1e] tech-corner-notch p-10 md:p-14 relative">
          
          {/* Unit Numbering & Micro-Labels */}
          <div className="absolute top-10 right-10 flex flex-col items-end opacity-20 select-none">
            <span className="text-[120px] font-black italic leading-none tech-glow-text">01</span>
            <div className="flex space-x-2 mt-[-20px]">
              <div className="w-10 h-1 bg-[var(--tech-accent)]"></div>
              <div className="w-2 h-1 bg-[var(--tech-accent)]"></div>
            </div>
          </div>

          <div className="absolute top-10 left-10 flex flex-col space-y-1 z-10">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-[var(--tech-accent)] shadow-[0_0_8px_var(--tech-glow)]"></div>
              <span className="text-[10px] font-black tracking-[0.5em] text-[var(--tech-accent)] uppercase">UNIT_GB.POMO.05</span>
            </div>
            <p className="font-mono text-[var(--tech-text-dim)] text-[8px] uppercase tracking-widest leading-none">NEURAL_CALIBRATION_ACTIVE</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 relative z-10 pt-20">
            
            {/* Left Column: Core Engine */}
            <div className="lg:col-span-12 xl:col-span-8 flex flex-col">
              <div className="tech-glass p-12 md:p-20 tech-corner-notch relative group border-white/5 border-dashed">
                {/* Internal HUD Elements */}
                <div className="absolute top-10 left-10 flex items-center space-x-4 opacity-50">
                  <div className="w-8 h-[1px] bg-white"></div>
                  <span className="text-[9px] font-mono tracking-tighter">TELEMETRY_SYNC</span>
                </div>

                <div 
                  className="text-[120px] md:text-[200px] font-mono font-black text-[var(--tech-text-bright)] mb-10 select-none tracking-tighter leading-none italic transition-all duration-700 flex justify-center items-center"
                  style={{ 
                    textShadow: isActive ? `0 0 ${glowStrength}px var(--tech-glow)` : 'none',
                  }}
                >
                  <span className={isActive ? 'animate-pulse' : ''}>{String(minutes).padStart(2, '0')}</span>
                  <span className="text-[var(--tech-accent)] opacity-20 px-2">:</span>
                  <span className={isActive ? 'animate-pulse delay-150' : ''}>{String(seconds).padStart(2, '0')}</span>
                </div>

                {/* Progress Visualizer */}
                <div className="w-full h-1 bg-black/40 rounded-full mb-12 overflow-hidden relative">
                   <div 
                    className="absolute inset-y-0 left-0 bg-[var(--tech-accent)] transition-all duration-1000 shadow-[0_0_20px_var(--tech-glow)]"
                    style={{ width: `${progress}%` }}
                   ></div>
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6">
                  <button 
                    onClick={toggleTimer}
                    className={`h-24 w-60 tech-btn tech-corner-notch flex items-center justify-center space-x-4 transition-all ${isActive ? 'tech-btn-active' : ''}`}
                    style={{ 
                      boxShadow: isActive ? `0 0 40px var(--tech-glow)` : 'none',
                      background: isActive ? 'var(--tech-accent)' : 'linear-gradient(180deg, #2a2d31 0%, #1a1c1e 100%)'
                    }}
                  >
                    {isActive ? <Pause size={28} className="text-black" /> : <Play size={28} className="text-[var(--tech-accent)]" />}
                    <span className={`font-black italic uppercase tracking-tighter text-[14px] ${isActive ? 'text-black' : 'text-white'}`}>
                      {isActive ? 'SUSPEND_CYCLE' : 'IGNITE_ENGINE'}
                    </span>
                  </button>
                  
                  <button 
                    onClick={resetTimer}
                    className="h-24 w-24 tech-btn tech-corner-notch flex items-center justify-center border-dashed group transition-all"
                  >
                    <RotateCcw size={24} className="group-hover:rotate-[-180deg] transition-transform duration-500" />
                  </button>
                </div>

                {/* Decorative Circular Ports */}
                <div className="absolute bottom-10 right-10 flex space-x-4 opacity-50">
                    <div className="w-3 h-3 rounded-full border border-white/20"></div>
                    <div className="w-3 h-3 rounded-full border border-white/20"></div>
                    <div className="w-3 h-3 rounded-full border border-[var(--tech-accent)] bg-[var(--tech-accent)] shadow-[0_0_10px_var(--tech-glow)]"></div>
                </div>
              </div>

              {/* Sub-panels (Objective & Calibration) */}
              <div className="grid md:grid-cols-2 gap-8 mt-12">
                <div className={`tech-glass p-8 tech-bracket border-l-2 border-l-[var(--tech-accent)] transition-all ${isActive ? 'opacity-30 pointer-events-none' : ''}`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <Target size={14} className="text-[var(--tech-accent)] opacity-50" />
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em]">02_Directive</span>
                  </div>
                  <input 
                    type="text"
                    value={sessionGoal}
                    onChange={(e) => setSessionGoal(e.target.value)}
                    placeholder="DEFINE_DATA_POINT..."
                    className="w-full bg-black/40 border-b border-white/10 p-4 text-[11px] font-black uppercase tracking-[0.2em] outline-none focus:border-[var(--tech-accent)] transition-all"
                  />
                </div>

                <div className={`tech-glass p-8 tech-bracket transition-all ${isActive ? 'opacity-30 pointer-events-none' : ''}`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <Settings2 size={14} className="text-[var(--tech-accent)] opacity-50" />
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em]">03_Synchronization</span>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                       <span className="italic">NEURAL_LOAD</span>
                       <span className="text-[var(--tech-accent)] font-mono">{intensity}%</span>
                    </div>
                    <div className="relative h-2 bg-black/60 rounded-full group cursor-pointer">
                      <input 
                        type="range"
                        min="5" max="100"
                        value={intensity}
                        onChange={(e) => setIntensity(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                      />
                      <div 
                        className="absolute inset-y-0 left-0 bg-[var(--tech-accent)] shadow-[0_0_15px_var(--tech-glow)] transition-all duration-300 rounded-full"
                        style={{ width: `${intensity}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Protocols & Audio */}
            <div className="lg:col-span-12 xl:col-span-4 space-y-8 flex flex-col">
              
              {/* Preset Protocols */}
              <div className="tech-glass p-8 relative flex-1 min-h-[300px]">
                <div className="flex items-center space-x-3 mb-10">
                   <div className="w-1 h-6 bg-red-500"></div>
                   <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em] italic">04_Stored_Protocols</h3>
                </div>
                <div className="space-y-4">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selectPreset(p.id)}
                      disabled={isActive}
                      className={`w-full p-6 tech-bracket transition-all flex items-center justify-between border ${
                        activePreset === p.id 
                          ? 'bg-[var(--tech-accent)]/10 border-[var(--tech-accent)]/50' 
                          : 'bg-black/20 border-white/5 hover:border-white/10'
                      } ${isActive ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-4">
                         <div className={`w-2 h-2 rounded-full ${activePreset === p.id ? 'bg-[var(--tech-accent)]' : 'bg-zinc-800'}`}></div>
                         <span className={`text-[10px] font-black tracking-widest italic ${activePreset === p.id ? 'text-white' : 'text-zinc-600'}`}>
                           {p.label}
                         </span>
                      </div>
                      <span className="font-mono text-[12px] font-bold text-[var(--tech-accent)]">{p.duration}:00</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Acoustic Shielding */}
              <div className="tech-glass p-8 relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-6 bg-[var(--tech-accent)]"></div>
                    <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em] italic">05_Shielding_Modules</h3>
                  </div>
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2 transition-colors ${isMuted ? 'text-red-500' : 'text-zinc-500'}`}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {AMBIENT_SOUNDS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSound(s.id)}
                      className={`flex flex-col items-center justify-center p-4 transition-all relative group ${
                        activeSound === s.id 
                          ? 'bg-[var(--tech-accent)]' 
                          : 'bg-black/20 hover:bg-white/5 opacity-50'
                      }`}
                    >
                      <s.icon size={16} className={activeSound === s.id ? 'text-black' : 'text-zinc-400 group-hover:text-white'} />
                      <span className={`text-[7px] font-black mt-2 tracking-tighter ${activeSound === s.id ? 'text-black' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                        {s.label.split('_')[1]}
                      </span>
                      {activeSound === s.id && (
                        <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tech-indent tech-corner-notch p-6 border-transparent bg-black/60 relative">
                 <div className="absolute top-2 right-2 opacity-10">
                    <Cpu size={32} />
                 </div>
                 <span className="text-[9px] font-mono text-[var(--tech-accent)] uppercase tracking-widest italic block mb-2">AUTH_TOKEN: GRIND_ACTIVE</span>
                 <p className="text-[8px] font-mono text-zinc-600 uppercase leading-relaxed font-bold">
                    Biometric sync confirmed. Neural Engine protocol v2.1.0-STABLE. All shielding modules reporting optimal resonance.
                 </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Outer Telemetry Decoration */}
      <div className="mt-12 flex space-x-32 opacity-20 select-none">
        <div className="flex flex-col items-start font-mono text-[10px]">
          <span className="text-[var(--tech-accent)]">GRID_X_OFFSET: 42.09</span>
          <span>LATENCY: 4ms</span>
        </div>
        <div className="flex flex-col items-end font-mono text-[10px]">
          <span className="text-[var(--tech-accent)]">SECURE_CHANNEL: ACTIVE</span>
          <span>TIMESTAMP: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};
