import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Pause, Play, Square, Coffee, Brain, Sparkles, Minimize2, Maximize2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db, doc, updateDoc } from '../lib/firebase';
import { toast } from 'sonner';

interface AppGlobalTimerBarProps {
  userData: any;
}

export default function AppGlobalTimerBar({ userData }: AppGlobalTimerBarProps) {
  const [displayTime, setDisplayTime] = useState('00:00');
  const [progress, setProgress] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const constraintsRef = React.useRef(null);

  const activeTimer = userData?.activeTimer;
  const isRunning = activeTimer?.isRunning || false;
  const mode = activeTimer?.mode || 'study';

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const tick = () => {
      if (!activeTimer) {
        setDisplayTime('00:00');
        setProgress(0);
        return;
      }

      const now = Date.now();
      let remaining = 0;

      if (isRunning && activeTimer.targetEndTime) {
        remaining = Math.max(0, Math.ceil((activeTimer.targetEndTime - now) / 1000));
      } else {
        remaining = activeTimer.remainingSecondsAtPause || 0;
      }

      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      setDisplayTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      
      const initial = activeTimer.initialSeconds || 1;
      setProgress(((initial - remaining) / initial) * 100);

      // Auto-complete if reached 0 and was running
      if (isRunning && remaining === 0) {
         // We handle completion in AppStudyTimer or a shared service
         // For now, let's just show 00:00
      }
    };

    tick();
    if (isRunning) {
      interval = setInterval(tick, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer, isRunning]);

  const toggleTimer = async () => {
    if (!userData) return;
    const userRef = doc(db, 'users', userData.uid);
    const now = Date.now();

    if (isRunning) {
      // Pause
      const remaining = Math.max(0, Math.ceil((activeTimer.targetEndTime - now) / 1000));
      await updateDoc(userRef, {
        'activeTimer.isRunning': false,
        'activeTimer.remainingSecondsAtPause': remaining,
        'activeTimer.targetEndTime': null
      });
      toast.info("Timer paused");
    } else {
      // Resume
      const remaining = activeTimer?.remainingSecondsAtPause || activeTimer?.initialSeconds || 25 * 60;
      await updateDoc(userRef, {
        'activeTimer.isRunning': true,
        'activeTimer.targetEndTime': now + (remaining * 1000)
      });
      toast.success("Timer resumed");
    }
  };

  if (!activeTimer) return null;

  /**
   * Draggable & Minimizable Implementation:
   * 1. Draggable: The root motion.div uses the `drag` prop from framer-motion. 
   *    `dragConstraints` are set to keep the timer within a reasonable screen range.
   *    `dragMomentum={false}` ensures the timer stops exactly where the user lets go.
   * 2. Minimizable: Controlled via the `isMinimized` state.
   *    - When true, we show a compact bubble (`motion.button`) containing only the time and a "pulse" animation.
   *    - When false, we show the full control bar (`motion.div`).
   *    - `AnimatePresence` with `mode="wait"` handles smooth cross-fading between states.
   */
  return (
    <>
      <div ref={constraintsRef} className="fixed inset-4 pointer-events-none z-[90]" />
      <motion.div 
        drag
        dragMomentum={false}
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        initial={{ y: 100, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
        width: isMinimized ? 'auto' : '100%',
      }}
      className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] cursor-grab active:cursor-grabbing ${isMinimized ? 'w-auto' : 'w-full max-w-xl px-4'}`}
    >
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.button
            key="minimized"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsMinimized(false)}
            className={`group relative flex items-center gap-3 p-3 rounded-full shadow-2xl backdrop-blur-xl border border-white/10 ${mode === 'study' ? 'bg-primary/90' : 'bg-primary/40'} text-white overflow-hidden`}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center gap-2 px-1">
              {isRunning ? (
                <div className="flex gap-0.5">
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, 12, 4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1 bg-white rounded-full translate-y-1"
                    />
                  ))}
                </div>
              ) : <Timer className="h-4 w-4" />}
              <span className="text-sm font-mono font-black">{displayTime}</span>
              <Maximize2 className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            
            {/* Minimal progress line */}
            <motion.div 
              className="absolute bottom-0 left-0 h-1 bg-white/30"
              animate={{ width: `${progress}%` }}
            />
          </motion.button>
        ) : (
          <motion.div 
            key="expanded"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-4 shadow-2xl flex items-center gap-6 relative overflow-hidden group pr-6"
          >
            {/* Drag Handle */}
            <div className="flex flex-col gap-0.5 cursor-grab active:cursor-grabbing text-white/20 hover:text-white/40 transition-colors px-1">
              <GripVertical className="h-5 w-5" />
            </div>

            {/* Progress Bar Background */}
            <div className="absolute bottom-0 left-0 h-1.5 bg-white/5 w-full overflow-hidden">
              <motion.div 
                initial={false}
                animate={{ width: `${progress}%` }}
                className={`h-full ${mode === 'study' ? 'bg-primary' : 'bg-primary/40'} transition-all`}
              />
            </div>

            {/* Info & Mode */}
            <div className="flex items-center gap-3 min-w-[140px]">
              <div className={`p-2.5 rounded-2xl ${mode === 'study' ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
                {mode === 'study' ? <Brain className="h-5 w-5" /> : <Coffee className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Focus Timer
                </p>
                <p className="text-sm font-bold text-white truncate max-w-[100px]">
                  {userData.activeTimer.topic || 'General Session'}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-10 w-px bg-white/10" />

            {/* Time Display */}
            <div className="flex-1 flex flex-col items-center">
                <span className="text-4xl font-mono font-black text-white tracking-tighter transition-all group-hover:scale-105 select-none">
                  {displayTime}
                </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button 
                size="icon" 
                onClick={toggleTimer}
                className={`rounded-2xl h-11 w-11 border-none shadow-lg transition-all active:scale-90 ${isRunning ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-primary text-white hover:bg-primary/90'}`}
              >
                {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-2xl h-11 w-11 text-slate-400 hover:text-white hover:bg-white/5"
                onClick={() => setIsMinimized(true)}
                title="Minimize Timer"
              >
                <Minimize2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Decorative Sparkle */}
            {isRunning && mode === 'study' && (
                <motion.div 
                   animate={{ 
                     opacity: [0, 1, 0],
                     scale: [0.5, 1.2, 0.5],
                     rotate: [0, 180, 0]
                   }}
                   transition={{ duration: 3, repeat: Infinity }}
                   className="absolute top-3 right-8 pointer-events-none"
                >
                    <Sparkles className="h-3 w-3 text-primary/50" />
                </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </>
  );
}
