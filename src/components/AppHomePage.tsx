import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Timer, ShoppingBag, Trophy, Play, Info, ArrowRight, Star, Heart, Users } from 'lucide-react';
import AppLogo from './AppLogo';
import AppCharacterPreview from './AppCharacterPreview';

interface AppHomePageProps {
  userData: any;
  onEnterLab: () => void;
  onStartTutorial: () => void;
}

export default function AppHomePage({ userData, onEnterLab, onStartTutorial }: AppHomePageProps) {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden relative">
      {/* Background blobs for aesthetics */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[5%] right-[-5%] w-[30%] h-[30%] bg-amber-50/50 rounded-full blur-[100px] -z-10" />

      {/* Floating Elements Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, opacity: 0.1 }}
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 5 + i, 
              repeat: Infinity, 
              delay: i * 0.5 
            }}
            className="absolute"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
            }}
          >
            <Star className={`h-${4 + (i%3)*2} w-${4 + (i%3)*2} text-indigo-200`} />
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <AppLogo size="lg" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-8xl font-black tracking-tight mb-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent"
        >
          The Learning Lab
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl text-xl text-slate-500 mb-12 leading-relaxed"
        >
          Ready for a new way to study? Pick a buddy in the Learning Lab. 
          Complete interactive quests in our virtual rooms.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Button 
            onClick={onEnterLab}
            className="h-16 px-10 rounded-full bg-slate-900 text-white hover:bg-slate-800 text-lg font-bold shadow-xl shadow-indigo-100 group transition-all"
          >
            Enter The Lab
            <Play className="ml-3 h-5 w-5 fill-current group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="outline"
            onClick={onStartTutorial}
            className="h-16 px-10 rounded-full border-2 border-slate-200 text-slate-600 hover:bg-slate-50 text-lg font-bold"
          >
            How it works
            <Info className="ml-3 h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Feature Bento Grid */}
      <section className="container mx-auto px-6 py-20 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Study Buddy */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-1 p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center group"
          >
            <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-6 ring-4 ring-white shadow-sm group-hover:scale-110 transition-transform">
              <AppCharacterPreview character={userData?.character} size="sm" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Study buddy</h3>
            <p className="text-slate-500">The buddy grows as you study. It stays happy when you work.</p>
          </motion.div>

          {/* Card 2: AI Quests */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-1 p-8 rounded-[3rem] bg-indigo-900 text-white shadow-2xl flex flex-col items-center text-center overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-10 opacity-10"><Brain className="w-32 h-32" /></div>
            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center mb-6 backdrop-blur-sm">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Study quests</h3>
            <p className="text-indigo-100/80">Turn your notes into quizzes. Earn points for everything you finish.</p>
          </motion.div>

          {/* Card 3: Social Lobby */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-1 p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center group"
          >
            <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mb-6 ring-4 ring-white shadow-sm group-hover:scale-110 transition-transform">
              <Users className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Private rooms</h3>
            <p className="text-slate-500">Create locked rooms for you and your friends. Study together in a quiet space.</p>
          </motion.div>

          {/* Card 4: Rewards (Wide) */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-2 p-10 rounded-[3rem] bg-emerald-50 border border-emerald-100 flex flex-col md:flex-row items-center gap-10 overflow-hidden relative"
          >
             <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest">
                <Trophy className="h-3 w-3" /> Achievements
              </div>
              <h3 className="text-4xl font-bold text-emerald-900">Get new items</h3>
              <p className="text-emerald-700/80 text-lg">
                Earn points while you work. Use them at the shop to get new animals and outfits.
              </p>
            </div>
            <div className="flex gap-4 p-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                <div className="bg-white p-4 rounded-3xl shadow-sm"><ShoppingBag className="w-8 h-8 text-emerald-500" /></div>
                <div className="bg-white p-4 rounded-3xl shadow-sm"><Heart className="w-8 h-8 text-pink-500" /></div>
                <div className="bg-white p-4 rounded-3xl shadow-sm"><Star className="w-8 h-8 text-yellow-500" /></div>
            </div>
          </motion.div>

          {/* Card 5: Timer */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-1 p-8 rounded-[3rem] bg-slate-900 text-white flex flex-col items-center text-center group"
          >
            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center mb-6 backdrop-blur-sm group-hover:bg-primary transition-all">
              <Timer className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Timer</h3>
            <p className="text-slate-400">Keep track of your time. See how much you did with simple summaries.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
             <AppLogo size="sm" />
             <span className="font-bold text-xl tracking-tight">The Learning Lab</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 The Learning Lab. Start a study session.</p>
          <div className="flex gap-6">
             <button className="text-slate-400 hover:text-indigo-600 transition-colors text-sm font-medium">Privacy</button>
             <button className="text-slate-400 hover:text-indigo-600 transition-colors text-sm font-medium">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
