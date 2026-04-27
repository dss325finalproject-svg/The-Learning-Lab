import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Timer, 
  Brain, 
  BookOpen, 
  ShoppingBag, 
  Trophy, 
  Sparkles, 
  Coins, 
  HandMetal,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppHowItWorks({ onDismiss }: { onDismiss?: () => void }) {
  const features = [
    {
      icon: <Timer className="h-6 w-6 text-primary" />,
      title: "Focus Sessions",
      description: "Set your own study and break durations. Stay focused to earn 1 point for every minute you study. Consistency is the key to mastery!"
    },
    {
      icon: <Brain className="h-6 w-6 text-blue-500" />,
      title: "AI Study Buddy",
      description: "Stuck on a concept? Use the AI Assistant to get clear explanations or generate insights based on your current study topic."
    },
    {
      icon: <BookOpen className="h-6 w-6 text-emerald-500" />,
      title: "Study Strategy",
      description: "Upload your notes to 'Study Materials'. Our AI analyzes your content to create a personalized study strategy tailored just for you."
    },
    {
      icon: <Trophy className="h-6 w-6 text-yellow-500" />,
      title: "The Leaderboard",
      description: "Compete with scholars from around the world. Rankings are purely based on total time studied. True dedication is rewarded here!"
    },
    {
      icon: <ShoppingBag className="h-6 w-6 text-purple-500" />,
      title: "The Quest Shop",
      description: "Spend points on hats, outfits, and accessories. Your character preview in the sidebar updates as you equip new gear. Show off your status!"
    },
    {
      icon: <Sparkles className="h-6 w-6 text-pink-500" />,
      title: "Atmospheres",
      description: "Switch between Nature or Ocean themes to create your perfect study sanctuary."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden ring-1 ring-black/[0.05]">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-blue-500 to-emerald-500" />
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2 font-display">Welcome to The Learning Lab</h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Your journey to academic mastery starts here. We've made the study experience interactive to keep you motivated, focused, and rewarded.
              </p>
            </div>
            {onDismiss && (
              <Button variant="ghost" size="icon" onClick={onDismiss} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-50 ring-1 ring-slate-100">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap gap-6 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-[10px] ring-2 ring-white">Lv.</div>
                 <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white ring-2 ring-white"><Coins className="h-4 w-4" /></div>
              </div>
              <p className="text-xs font-medium text-slate-500 italic max-w-sm">
                Tip: Completing a 25-minute session earns you 25 points. Collect them to build your ultimate scholar!
              </p>
            </div>
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <HandMetal className="h-5 w-5" />
              <span>Happy Questing!</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
