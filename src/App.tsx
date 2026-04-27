import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider, signInWithPopup, onAuthStateChanged, doc, getDoc, setDoc, onSnapshot } from './lib/firebase';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Timer, ShoppingBag, Brain, Trophy, LogOut, Sparkles, BookOpen, Droplets, Leaf, TreePine, Trees, Waves, LayoutGrid, HelpCircle, DoorOpen, Volume2 } from 'lucide-react';
import AppStudyTimer from './components/AppStudyTimer';
import AppShop from './components/AppShop';
import AppAIAssistant from './components/AppAIAssistant';
import AppLeaderboard from './components/AppLeaderboard';
import AppCharacterPreview from './components/AppCharacterPreview';
import AppStudyMaterials from './components/AppStudyMaterials';
import AppOnboardingTutorial from './components/AppOnboardingTutorial';
import AppLogo from './components/AppLogo';
import AppLobby from './components/AppLobby';
import AppRoom from './components/AppRoom';
import AppHomePage from './components/AppHomePage';
import AppGlobalTimerBar from './components/AppGlobalTimerBar';
import { motion, AnimatePresence } from 'motion/react';
import { updateDoc } from 'firebase/firestore';

const natureImages = [
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1920&auto=format&fit=crop',
];

const oceanImages = [
  'https://images.unsplash.com/photo-1505118380757-91f5f45d8de0?q=80&w=1920&auto=format&fit=crop', // Clear turquoise ripples
  'https://images.unsplash.com/photo-1544923246-77307dd654ca?q=80&w=1920&auto=format&fit=crop', // Deep ocean water texture
  'https://images.unsplash.com/photo-1439405326854-01518d04a4c3?q=80&w=1920&auto=format&fit=crop', // Infinite blue horizon
  'https://images.unsplash.com/photo-1468413253725-0d5181091126?q=80&w=1920&auto=format&fit=crop', // Crashing wave action
];

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timer');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isAppStarted, setIsAppStarted] = useState(false);

  useEffect(() => {
    if (!userData?.theme || userData.theme === 'default') {
      setBgImage(null);
      return;
    }

    const updateBg = () => {
      const hour = new Date().getHours();
      const images = userData.theme === 'ocean' ? oceanImages : natureImages;
      const selectedImage = images[hour % images.length];
      setBgImage(selectedImage);
    };

    updateBg();
    const interval = setInterval(updateBg, 1000 * 60 * 30); // Check every 30 mins
    return () => clearInterval(interval);
  }, [userData?.theme]);

  const updateTheme = async (theme: string) => {
    if (!user) return;
    
    // Optimistic update
    setUserData((prev: any) => ({ ...prev, theme }));
    
    // Immediate background update for better UX
    if (theme === 'default') {
      setBgImage(null);
    } else {
      const images = theme === 'ocean' ? oceanImages : natureImages;
      const hour = new Date().getHours();
      setBgImage(images[hour % images.length]);
    }
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { theme }, { merge: true });
      toast.success(`Theme updated to ${theme}`);
    } catch (error) {
      toast.error('Failed to update theme');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const initialData = { 
            uid: user.uid, 
            displayName: user.displayName, 
            photoURL: user.photoURL, 
            points: 0, 
            totalStudyTime: 0, 
            character: { base: 'bear', hat: 'none', outfit: 'none', accessory: 'none' }, 
            inventory: ['bear'], 
            theme: 'default',
            learningStyle: 'readWrite', // Default to text style
            hasSeenTutorial: false 
          };
          await setDoc(userRef, initialData);
          setUserData(initialData);
          setShowTutorial(true);
        } else {
          const data = userSnap.data();
          if (!data.hasSeenTutorial) {
            setShowTutorial(true);
          }
          onSnapshot(userRef, (doc) => { setUserData(doc.data()); });
        }
      } else { setUser(null); setUserData(null); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => { try { await signInWithPopup(auth, googleProvider); toast.success('Logged in!'); } catch (error) { toast.error('Login failed'); } };
  const handleLogout = () => { auth.signOut(); toast.info('Logged out'); };

  const completeTutorial = async () => {
    setShowTutorial(false);
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { 
        hasSeenTutorial: true,
        learningStyle: 'readWrite'
      });
    } catch (e) {
      console.error("Error updating tutorial state", e);
    }
  };

  if (loading || (user && !userData)) return (<div className="flex h-screen items-center justify-center bg-slate-50"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Sparkles className="h-12 w-12 text-primary" /></motion.div></div>);

  if (!user) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFCFB] p-6 text-slate-900 relative overflow-hidden">
      {/* Decorative background elements for login */}
      <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10 animate-pulse" />
      <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-50 -z-10" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg">
        <div className="flex justify-center mb-8">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              y: [0, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <AppLogo size="lg" />
          </motion.div>
        </div>
        <h1 className="mb-4 text-5xl md:text-6xl font-black tracking-tight text-slate-900 bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
          The Learning Lab
        </h1>
        <p className="mb-10 text-xl text-slate-500 font-medium">
          Where study meets play. Join the quest for knowledge with your tiny companions.
        </p>
        <Button 
          onClick={handleLogin} 
          size="lg" 
          className="h-16 px-10 rounded-full bg-slate-900 text-white hover:bg-slate-800 text-lg font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95"
        >
          Begin Your Quest
        </Button>
        <p className="mt-8 text-sm text-slate-400">Join thousands of students elevating their study time.</p>
      </motion.div>
    </div>
  );

  if (!isAppStarted) return (
    <AppHomePage 
      userData={userData} 
      onEnterLab={() => setIsAppStarted(true)} 
      onStartTutorial={() => {
        setIsAppStarted(true);
        setShowTutorial(true);
      }}
    />
  );

  const themeClass = userData?.theme ? `theme-${userData.theme}` : '';
  const hasTheme = userData?.theme && userData?.theme !== 'default';
  const baseBg = userData?.theme === 'ocean' ? 'bg-[#001D24]' : userData?.theme === 'nature' ? 'bg-[#FDFDFB]' : 'bg-background';

  return (
    <div className={`flex h-screen ${baseBg} text-foreground overflow-hidden relative ${themeClass} transition-all duration-1000`}>
      {/* Dynamic Background Image */}
      <AnimatePresence mode="wait">
        {bgImage && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <motion.img
              key={bgImage}
              src={bgImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0 w-full h-full object-cover"
              alt=""
            />
            {/* Subtle overlay to ensure readability without losing the immersive look */}
            <div className={`absolute inset-0 transition-all duration-1000 ${userData?.theme === 'ocean' ? 'bg-indigo-950/20 backdrop-blur-[1px]' : 'bg-white/30 backdrop-blur-[1px]'}`} />
          </div>
        )}
      </AnimatePresence>

      {/* Back to Home Button in Sidebar */}
      <aside className="w-64 bg-card/90 backdrop-blur-md border-r border-border flex flex-col relative z-20 shadow-xl shadow-slate-200/20 overflow-y-auto scrollbar-thin">
        <div className="p-6 border-b border-border flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <AppLogo size="sm" />
            <span className="text-xl font-bold tracking-tight">The Lab</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAppStarted(false)} 
            className="w-full justify-start text-[10px] uppercase tracking-widest font-black text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-50 border-slate-100"
          >
            ← Leave Lab
          </Button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          <SidebarItem id="tut-timer" icon={<Timer />} label="Focus Timer" active={activeTab === 'timer'} onClick={() => setActiveTab('timer')} />
          <SidebarItem id="tut-rooms" icon={<DoorOpen />} label="Study Rooms" active={activeTab === 'rooms'} onClick={() => setActiveTab('rooms')} />
          <SidebarItem id="tut-ai" icon={<Brain />} label="AI Assistant" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
          <SidebarItem id="tut-materials" icon={<BookOpen />} label="Study Materials" active={activeTab === 'materials'} onClick={() => setActiveTab('materials')} />
          <SidebarItem id="tut-shop" icon={<ShoppingBag />} label="Quest Shop" active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} />
          <SidebarItem id="tut-leaderboard" icon={<Trophy />} label="Leaderboard" active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} />
        </nav>
        
        <div id="tut-theme" className="px-4 py-4 border-t border-border space-y-4">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 font-display">Choose Theme</p>
            <div className="grid grid-cols-3 gap-1 px-1">
              <button 
                onClick={() => updateTheme('default')} 
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors group ${(!userData?.theme || userData.theme === 'default') ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
              >
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${(!userData?.theme || userData.theme === 'default') ? 'bg-black text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                  <LayoutGrid className="h-4 w-4" />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${(!userData?.theme || userData.theme === 'default') ? 'text-black' : 'text-slate-400 group-hover:text-slate-600'}`}>Default</span>
              </button>

              <button 
                onClick={() => updateTheme('nature')} 
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors group ${(userData?.theme === 'nature') ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
              >
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${(userData?.theme === 'nature') ? 'bg-[#C4D7B2] text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                  <TreePine className="h-4 w-4" />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${(userData?.theme === 'nature') ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'}`}>Nature</span>
              </button>

              <button 
                onClick={() => updateTheme('ocean')} 
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors group ${(userData?.theme === 'ocean') ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
              >
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${(userData?.theme === 'ocean') ? 'bg-[#A0C4FF] text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                  <Waves className="h-4 w-4" />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${(userData?.theme === 'ocean') ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-600'}`}>Ocean</span>
              </button>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100/50 px-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-display">Learning Mode</p>
            <p className="text-xs font-medium text-slate-600">Text-based Learning</p>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-slate-50/50 space-y-4">
          <div id="tut-character" className="flex justify-center py-2 relative group cursor-help" onClick={() => setShowTutorial(true)}>
            <AppCharacterPreview character={userData?.character} size="sm" />
            <div className="absolute top-0 right-0 bg-white shadow-sm border border-slate-200 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <HelpCircle className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={user.photoURL || ''} className="h-10 w-10 rounded-full border-2 border-primary/20" alt="Profile" />
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-[10px] font-bold px-1 rounded border border-white">LVL {Math.floor((userData?.totalStudyTime || 0) / 3600) + 1}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.displayName}</p>
              <p className="text-xs text-slate-500 font-medium">{userData?.points || 0} Points</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-500">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab + (activeTab === 'rooms' ? currentRoomId : '')} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
            {activeTab === 'timer' && <AppStudyTimer userData={userData} />}
            {activeTab === 'rooms' && (
              currentRoomId ? (
                <AppRoom 
                  roomId={currentRoomId} 
                  userData={userData} 
                  onLeave={() => setCurrentRoomId(null)} 
                />
              ) : (
                <AppLobby 
                  userData={userData} 
                  onJoinRoom={(id) => setCurrentRoomId(id)} 
                />
              )
            )}
            {activeTab === 'ai' && <AppAIAssistant userData={userData} />}
            {activeTab === 'materials' && <AppStudyMaterials userData={userData} />}
            {activeTab === 'shop' && <AppShop userData={userData} />}
            {activeTab === 'leaderboard' && <AppLeaderboard currentUserId={user.uid} />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Toaster position="top-right" />
      <AnimatePresence>
        {isAppStarted && userData?.activeTimer && (
          <AppGlobalTimerBar userData={userData} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showTutorial && (
          <AppOnboardingTutorial onComplete={completeTutorial} />
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, id }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, id?: string }) {
  return (
    <button id={id} onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-brand-50 text-primary shadow-sm ring-1 ring-brand-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
      {React.cloneElement(icon as React.ReactElement, { className: 'h-5 w-5' })}
      {label}
    </button>
  );
}
