import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Brain, Sparkles, Leaf, Droplets } from 'lucide-react';
import { db, doc, updateDoc, addDoc, collection, serverTimestamp, setDoc } from '../lib/firebase';
import { toast } from 'sonner';
import { getMotivationalMessage, generateSessionSummary, SessionSummary } from '../lib/gemini';
import confetti from 'canvas-confetti';

import { motion, AnimatePresence } from 'motion/react';
import AppHowItWorks from './AppHowItWorks';
import AppCharacterPreview from './AppCharacterPreview';
import AppSessionSummary from './AppSessionSummary';

export default function AppStudyTimer({ userData }: { userData: any }) {
  const [showIntro, setShowIntro] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [topic, setTopic] = useState('');
  const [materials, setMaterials] = useState('');
  const [studyMode, setStudyMode] = useState<'solo' | 'friend'>('solo');
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state with userData.activeTimer (Persistent state)
  useEffect(() => {
    if (userData?.activeTimer) {
      const active = userData.activeTimer;
      setTopic(active.topic || '');
      setMaterials(active.materials || '');
      setMode(active.mode || 'study');
      setStudyMode(active.studyMode || 'solo');
      setStudyMinutes(active.studyMinutes || 25);
      setBreakMinutes(active.breakMinutes || 5);
      setInitialTime(active.initialSeconds || 25 * 60);
      setIsActive(active.isRunning || false);
      
      // Calculate remaining time
      if (active.isRunning && active.targetEndTime) {
        const remaining = Math.max(0, Math.ceil((active.targetEndTime - Date.now()) / 1000));
        setTimeLeft(remaining);
      } else {
        setTimeLeft(active.remainingSecondsAtPause || active.initialSeconds || 25 * 60);
      }
    }
  }, [userData?.uid]); // Only sync fully on load or user change

  // Auto-save topic and materials
  useEffect(() => {
    if (!userData) return;
    const saveTimerData = async () => {
       const userRef = doc(db, 'users', userData.uid);
       await updateDoc(userRef, {
         'activeTimer.topic': topic,
         'activeTimer.materials': materials,
         'activeTimer.studyMode': studyMode
       });
    };
    const timeout = setTimeout(saveTimerData, 1000);
    return () => clearTimeout(timeout);
  }, [topic, materials]);

  const updateDuration = async (mins: number) => {
    if (isActive) return;
    if (!userData) return;

    const secs = mins * 60;
    const userRef = doc(db, 'users', userData.uid);
    
    const updatePayload: any = {
      'activeTimer.isRunning': false,
      'activeTimer.remainingSecondsAtPause': secs,
      'activeTimer.initialSeconds': secs,
      'activeTimer.targetEndTime': null
    };

    if (mode === 'study') {
      setStudyMinutes(mins);
      updatePayload['activeTimer.studyMinutes'] = mins;
    } else {
      setBreakMinutes(mins);
      updatePayload['activeTimer.breakMinutes'] = mins;
    }

    setInitialTime(secs);
    setTimeLeft(secs);
    await updateDoc(userRef, updatePayload);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => { 
        // We calculate based on targetTime to be frame-rate independent
        if (userData?.activeTimer?.targetEndTime) {
            const remaining = Math.max(0, Math.ceil((userData.activeTimer.targetEndTime - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0) handleTimerComplete();
        } else {
            setTimeLeft((prev) => prev - 1); 
        }
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft, userData?.activeTimer?.targetEndTime]);

  const toggleTimer = async () => {
    if (!userData) return;
    const userRef = doc(db, 'users', userData.uid);
    const now = Date.now();

    if (isActive) {
        // Pause
        await updateDoc(userRef, {
            'activeTimer.isRunning': false,
            'activeTimer.remainingSecondsAtPause': timeLeft,
            'activeTimer.targetEndTime': null
        });
    } else {
        // Start/Resume
        await updateDoc(userRef, {
            'activeTimer.isRunning': true,
            'activeTimer.targetEndTime': now + (timeLeft * 1000),
            'activeTimer.mode': mode,
            'activeTimer.initialSeconds': initialTime,
            'activeTimer.topic': topic,
            'activeTimer.materials': materials
        });
    }
    setIsActive(!isActive);
  };

  const handleTimerComplete = async () => {
    if (!userData) return;
    setIsActive(false);

    const userRef = doc(db, 'users', userData.uid);
    
    if (mode === 'study') {
      const pointsEarned = Math.floor(initialTime / 60) + (studyMode === 'friend' ? 50 : 0) + (initialTime >= 45 * 60 ? 25 : 0);
      const studyTime = initialTime;
      
      await updateDoc(userRef, { 
        points: (userData.points || 0) + pointsEarned, 
        totalStudyTime: (userData.totalStudyTime || 0) + studyTime,
        'activeTimer.isRunning': false,
        'activeTimer.remainingSecondsAtPause': 0,
        'activeTimer.targetEndTime': null
      });

      await addDoc(collection(db, 'users', userData.uid, 'sessions'), { 
        userId: userData.uid, 
        startTime: serverTimestamp(), 
        duration: studyTime / 60, 
        pointsEarned, 
        topic: topic || 'General Study',
        materials: materials || 'None specified',
        mode: studyMode
      });

      const leaderboardRef = doc(db, 'leaderboard', userData.uid);
      await setDoc(leaderboardRef, { 
        displayName: userData.displayName, 
        photoURL: userData.photoURL, 
        totalStudyTime: (userData.totalStudyTime || 0) + studyTime 
      }, { merge: true });
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      
      // Motivational Statements
      const durationMins = studyTime / 60;
      if (durationMins >= 45) {
        toast.success("Session finished. Time: 45 minutes.", { duration: 5000 });
      } else if (durationMins >= 25) {
        toast.success("Session finished. Time: 25 minutes.", { duration: 4000 });
      } else {
        toast.success("Session finished.", { duration: 3000 });
      }

      setIsGeneratingSummary(true);
      try {
        const summary = await generateSessionSummary(
          studyTime / 60,
          studyMode,
          topic || 'General Study',
          materials || 'Self-study',
          userData?.learningStyle
        );
        setSessionSummary(summary);
      } catch (err) {
        console.error("Failed to generate summary", err);
        toast.error("Summary failed. Progress saved.");
      } finally {
        setIsGeneratingSummary(false);
      }

      setMode('break'); setTimeLeft(breakMinutes * 60); setInitialTime(breakMinutes * 60);
      await updateDoc(userRef, {
        'activeTimer.mode': 'break',
        'activeTimer.initialSeconds': breakMinutes * 60,
        'activeTimer.remainingSecondsAtPause': breakMinutes * 60
      });
    } else {
      toast.info("Break finished. Start study?");
      setMode('study'); setTimeLeft(studyMinutes * 60); setInitialTime(studyMinutes * 60);
      await updateDoc(userRef, {
        'activeTimer.mode': 'study',
        'activeTimer.initialSeconds': studyMinutes * 60,
        'activeTimer.remainingSecondsAtPause': studyMinutes * 60
      });
    }
  };

  const handleQuestReset = async () => {
    setTopic('');
    setMaterials('');
    if (!userData) return;
    const userRef = doc(db, 'users', userData.uid);
    await updateDoc(userRef, {
      'activeTimer.topic': '',
      'activeTimer.materials': ''
    });
    toast.info("Details cleared.");
  };

  const resetTimer = async () => { 
    if (!userData) return;
    const userRef = doc(db, 'users', userData.uid);
    const targetMins = mode === 'study' ? studyMinutes : breakMinutes;
    const secs = targetMins * 60;
    
    setIsActive(false);
    setTimeLeft(secs);
    setInitialTime(secs);

    await updateDoc(userRef, {
        'activeTimer.isRunning': false,
        'activeTimer.remainingSecondsAtPause': secs,
        'activeTimer.targetEndTime': null,
        'activeTimer.initialSeconds': secs
    });
  };
  const formatTime = (seconds: number) => { const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`; };
  const progress = ((initialTime - timeLeft) / initialTime) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <AnimatePresence>
        {showIntro && (
          <AppHowItWorks onDismiss={() => setShowIntro(false)} />
        )}
      </AnimatePresence>
      
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="border-none shadow-xl bg-white overflow-hidden">
        <div className={`h-2 w-full transition-colors duration-500 ${mode === 'study' ? 'bg-primary' : 'bg-primary/30'}`} />
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold">Focus Timer</CardTitle>
          <div className="flex justify-center gap-2 mt-4">
            {[10, 25, 45, 60].map((mins) => (
              <Button 
                key={mins} 
                variant={ (mode === 'study' ? studyMinutes : breakMinutes) === mins ? 'default' : 'outline'} 
                size="sm"
                onClick={() => updateDuration(mins)}
                disabled={isActive}
                className="h-8 px-3 rounded-full text-xs"
              >
                {mins}m
              </Button>
            ))}
            <div className="flex items-center gap-1 ml-2">
              <Input 
                type="number" 
                className="h-8 w-14 text-xs px-2 rounded-lg" 
                placeholder="Min"
                min={1}
                max={120}
                value={mode === 'study' ? studyMinutes : breakMinutes}
                onChange={(e) => updateDuration(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isActive}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center p-8">
          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            <div className={`absolute ${mode === 'break' ? '-right-28 top-1/2 -translate-y-1/2' : 'inset-x-0 -top-24 flex justify-center'} z-20 pointer-events-none transition-all duration-500`}>
              <AppCharacterPreview 
                character={userData?.character} 
                size="sm" 
                expressionOverride={
                  isActive && mode === 'study' ? 'focus' : 
                  mode === 'break' ? 'happy' : 
                  timeLeft === 0 && mode === 'study' ? 'excited' :
                  'neutral'
                }
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              {/* Theme icons removed as requested */}
            </div>
            <svg className="absolute w-full h-full -rotate-90">
              <circle cx="128" cy="128" r="120" fill="currentColor" className={`transition-colors duration-500 ${mode === 'study' ? 'text-transparent' : 'text-primary/5'}`} />
              <circle cx="128" cy="128" r="120" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
              <circle 
                cx="128" 
                cy="128" 
                r="120" 
                fill="transparent" 
                stroke="currentColor" 
                strokeWidth="8" 
                strokeDasharray={754} 
                strokeDashoffset={754 - (754 * progress) / 100} 
                strokeLinecap="round" 
                className={`transition-all duration-1000 ${mode === 'study' ? 'text-primary' : 'text-primary/40'}`} 
              />
            </svg>
            <div className={`text-6xl font-mono font-bold tracking-tighter relative z-10 transition-colors duration-500 ${mode === 'study' ? 'text-slate-900' : 'text-primary/70'}`}>{formatTime(timeLeft)}</div>
          </div>
          <div className="flex gap-4 mb-8">
            <Button size="lg" onClick={toggleTimer} className={`w-32 rounded-full transition-all duration-500 ${mode === 'study' ? 'bg-primary hover:bg-primary/90' : 'bg-primary/20 text-primary hover:bg-primary/30 border-none'}`}>
              {isGeneratingSummary ? (
                <Sparkles className="h-5 w-5 animate-spin" />
              ) : isActive ? (
                <Pause className="mr-2 h-5 w-5" />
              ) : (
                <Play className="mr-2 h-5 w-5" />
              )}
              {isGeneratingSummary ? 'Analyzing...' : isActive ? 'Pause' : 'Start'}
            </Button>
            <Button size="lg" variant="outline" onClick={resetTimer} className="rounded-full"><RotateCcw className="h-5 w-5" /></Button>
          </div>
          {mode === 'study' && (
            <div className="w-full max-w-sm space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Quest Details</Label>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleQuestReset}
                  disabled={isActive}
                  className="h-6 w-6 text-slate-400 hover:text-red-500"
                  title="Reset Quest Details"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-slate-500">What are you studying?</Label>
                <Input 
                  id="topic" 
                  placeholder="e.g. Biology Exam..." 
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)} 
                  disabled={isActive} 
                  className="bg-slate-50 border-slate-200 rounded-xl" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materials" className="text-slate-500">Materials used?</Label>
                <Input 
                  id="materials" 
                  placeholder="e.g. PowerPoint Slides, Chapter 4 Notes..." 
                  value={materials} 
                  onChange={(e) => setMaterials(e.target.value)} 
                  disabled={isActive} 
                  className="bg-slate-50 border-slate-200 rounded-xl" 
                />
              </div>
              <div className="flex items-center gap-4 pt-2">
                <Button
                  variant={studyMode === 'solo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStudyMode('solo')}
                  disabled={isActive}
                  className="rounded-full flex-1"
                >
                  Solo
                </Button>
                <Button
                  variant={studyMode === 'friend' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStudyMode('friend')}
                  disabled={isActive}
                  className="rounded-full flex-1"
                >
                  With Friend (+50 pts)
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>

    <AnimatePresence>
      {sessionSummary && (
        <AppSessionSummary
          userData={userData}
          duration={initialTime / 60}
          mode={studyMode}
          topic={topic}
          materials={materials}
          summary={sessionSummary}
          onClose={() => setSessionSummary(null)}
        />
      )}
    </AnimatePresence>
  </div>
);
}
