import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Sparkles, Brain, Timer, ShoppingBag, Trophy, User } from 'lucide-react';

interface tutorialStep {
  title: string;
  description: string;
  highlightId?: string;
  icon: React.ReactNode;
}

interface AppOnboardingTutorialProps {
  onComplete: (learningStyle?: string) => void;
}

const steps: tutorialStep[] = [
  {
    title: "Learning Lab",
    description: "Ready for a new way to study? Pick a buddy. Complete interactive quests in our virtual rooms.",
    icon: <Sparkles className="h-8 w-8 text-primary" />
  },
  {
    title: "Timer",
    description: "The timer tracks focus. Points are earned while it runs.",
    highlightId: "tut-timer",
    icon: <Timer className="h-8 w-8 text-primary" />
  },
  {
    title: "Study Quests",
    description: "Get tips or take quizzes. The buddy reacts to your progress.",
    highlightId: "tut-ai",
    icon: <Brain className="h-8 w-8 text-primary" />
  },
  {
    title: "Study buddy",
    description: "This is the buddy. It grows as you study. It reacts to quiz results.",
    highlightId: "tut-character",
    icon: <User className="h-8 w-8 text-primary" />
  },
  {
    title: "The Shop",
    description: "Spend points on new buddies and outfits.",
    highlightId: "tut-shop",
    icon: <ShoppingBag className="h-8 w-8 text-primary" />
  },
  {
    title: "Leaderboard",
    description: "See your rank. Points help you move up.",
    highlightId: "tut-leaderboard",
    icon: <Trophy className="h-8 w-8 text-primary" />
  },
  {
    title: "Themes",
    description: "Change the theme to keep the environment relaxing.",
    highlightId: "tut-theme",
    icon: <Sparkles className="h-8 w-8 text-primary" />
  },
  {
    title: "Ready",
    description: "You are ready to start. Earn points and move up.",
    icon: <RocketIcon className="h-8 w-8 text-primary" />
  }
];

function RocketIcon({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"/><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"/>
      </svg>
    </div>
  );
}

export default function AppOnboardingTutorial({ onComplete }: AppOnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const highlightId = steps[currentStep].highlightId;
    if (highlightId) {
      const element = document.getElementById(highlightId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Dimmed Background Overlay with hole */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 pointer-events-auto"
        style={{
          clipPath: targetRect 
            ? `polygon(0% 0%, 0% 100%, ${targetRect.left}px 100%, ${targetRect.left}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.bottom}px, ${targetRect.left}px ${targetRect.bottom}px, ${targetRect.left}px 100%, 100% 100%, 100% 0%)`
            : 'none'
        }}
        onClick={() => {}} // Block clicks to background
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="relative z-10 w-full max-w-md p-4 pointer-events-auto"
          style={targetRect ? {
            position: 'absolute',
            left: targetRect.right + 20 > window.innerWidth - 450 ? 'auto' : targetRect.right + 20,
            right: targetRect.right + 20 > window.innerWidth - 450 ? 20 : 'auto',
            top: Math.min(window.innerHeight - 300, Math.max(20, targetRect.top))
          } : {}}
        >
          <Card className="shadow-2xl border-primary/20 overflow-hidden">
            <div className="absolute top-0 left-0 w-1 bg-primary h-full" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-primary/10 rounded-xl mb-2">
                  {steps[currentStep].icon}
                </div>
                <Button variant="ghost" size="icon" onClick={onComplete} className="text-slate-400 hover:text-slate-600 h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-xl font-bold">{steps[currentStep].title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed">
                {steps[currentStep].description}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-slate-100 bg-slate-50/50 py-3">
              <div className="flex gap-1">
                {steps.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all ${idx === currentStep ? 'w-4 bg-primary' : 'w-1.5 bg-slate-300'}`} 
                  />
                ))}
              </div>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button variant="outline" size="sm" onClick={handleBack} className="h-8">
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                )}
                <Button size="sm" onClick={handleNext} className="h-8 bg-primary text-white">
                  {currentStep === steps.length - 1 ? "Start Studying" : "Next"}
                  {currentStep < steps.length - 1 && <ChevronRight className="ml-1 h-4 w-4" />}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
