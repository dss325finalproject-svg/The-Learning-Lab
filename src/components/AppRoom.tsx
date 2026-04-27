import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Trophy, 
  MessageCircle, 
  Map as MapIcon, 
  Clock, 
  Star,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Crown
} from 'lucide-react';
import { db, doc, collection, query, onSnapshot, setDoc, serverTimestamp, updateDoc, increment } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import AppCharacterPreview from './AppCharacterPreview';

interface AppRoomProps {
  roomId: string;
  userData: any;
  onLeave: () => void;
}

export default function AppRoom({ roomId, userData, onLeave }: AppRoomProps) {
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'area' | 'leaderboard'>('area');
  const [loading, setLoading] = useState(true);
  
  // Presence heartbeat
  useEffect(() => {
    if (!roomId || !userData) return;

    const memberRef = doc(db, `rooms/${roomId}/members`, userData.uid);
    const updatePresence = () => setDoc(memberRef, {
      uid: userData.uid,
      displayName: userData.displayName || 'Anonymous User',
      photoURL: userData.photoURL || '',
      points: userData.points || 0,
      timeSpent: userData.totalStudyTime || 0,
      lastActive: serverTimestamp(),
      character: userData.character || { base: 'default' }
    }, { merge: true });

    updatePresence();
    const interval = setInterval(updatePresence, 30000); // 30s heartbeat

    return () => clearInterval(interval);
  }, [roomId, userData]);

  // Listen to members and room info
  useEffect(() => {
    const roomRef = doc(db, 'rooms', roomId);
    const membersRef = collection(db, `rooms/${roomId}/members`);

    const unsubRoom = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        setRoomInfo({ id: doc.id, ...doc.data() });
      } else {
        toast.error("Room no longer exists");
        onLeave();
      }
      setLoading(false);
    });

    const unsubMembers = onSnapshot(membersRef, (snapshot) => {
      const memberList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Filter active in last 2 mins for 'Area' view, but show everyone for Leaderboard
      setMembers(memberList);
    });

    return () => {
      unsubRoom();
      unsubMembers();
    };
  }, [roomId]);

  if (loading) return <div className="p-20 text-center">Entering...</div>;

  const activeMembers = members.filter(m => {
    const lastActive = m.lastActive?.toMillis ? m.lastActive.toMillis() : 0;
    return Date.now() - lastActive < 120000;
  });

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col gap-6">
      {/* Top Header / Navigation */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-3xl border-4 border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onLeave} className="rounded-full hover:bg-slate-100">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Lobby
          </Button>
          <div className="h-8 w-[2px] bg-slate-100 mx-2" />
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {roomInfo?.name}
              <span className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Private</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('area')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'area' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <MapIcon className="w-4 h-4" />
            The Room
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'leaderboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Trophy className="w-4 h-4" />
            Leaderboard
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white/40 backdrop-blur-sm rounded-[3rem] border-4 border-dashed border-slate-200 overflow-hidden relative min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === 'area' ? (
            <motion.div 
              key="area"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-0 flex flex-wrap items-center justify-center gap-12 p-12 overflow-y-auto"
            >
              {/* This is the "Cute" hang out area with character previews */}
              {activeMembers.length === 0 ? (
                <p className="text-slate-400 font-medium">No one here yet.</p>
              ) : (
                activeMembers.map((member) => (
                  <div key={member.uid} className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-slate-50">
                         <AppCharacterPreview 
                           size="md" 
                           expressionOverride="happy"
                           character={member.character}
                         />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold border-2 border-white shadow-lg whitespace-nowrap">
                        {member.displayName}
                      </div>
                      {member.uid === roomInfo.creatorId && (
                        <div className="absolute -top-3 -right-3 bg-yellow-400 p-2 rounded-full border-2 border-white shadow-md">
                          <Crown className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {/* Background Decoration Elements */}
              <div className="absolute top-10 left-10 opacity-10"><Star className="w-12 h-12" /></div>
              <div className="absolute bottom-10 right-10 opacity-10 rotate-12"><Star className="w-16 h-16" /></div>
              <div className="absolute top-1/2 right-20 opacity-10 -rotate-12"><Star className="w-8 h-8" /></div>
            </motion.div>
          ) : (
            <motion.div 
              key="leaderboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-0 p-8 flex flex-col"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Rankings</h3>
                <p className="text-slate-500">Room points</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {members.sort((a,b) => b.points - a.points).map((member, index) => (
                  <div 
                    key={member.uid}
                    className="flex items-center gap-4 bg-white p-4 rounded-3xl border-2 border-slate-100 hover:border-indigo-100 transition-colors shadow-sm"
                  >
                    <div className="w-10 text-xl font-black text-slate-300 italic px-2">
                       {index + 1}
                    </div>
                    
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center p-2">
                       <AppCharacterPreview 
                           size="sm" 
                           expressionOverride="happy"
                           character={member.character}
                         />
                    </div>

                    <div className="flex-1">
                      <div className="font-bold text-lg text-slate-800 flex items-center gap-2">
                         {member.displayName}
                         {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                      </div>
                      <div className="text-slate-400 text-sm flex items-center gap-4 mt-1">
                         <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {member.points} PTS</span>
                         <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-indigo-400" /> {Math.floor(member.timeSpent / 60)}m</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                       <div className="text-2xl font-black text-indigo-600">
                          {member.points}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Start Guide Banner (Sub-footer) */}
      <div className="bg-indigo-50 border-2 border-indigo-100 p-6 rounded-[2.5rem] flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-100">
             <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-indigo-900">Study session</h4>
            <p className="text-indigo-600/70 text-sm">Stay active to earn points.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-6 border-r border-indigo-200">
             <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Your Rank</div>
             <div className="text-2xl font-black text-indigo-900">
                #{members.sort((a,b) => b.points - a.points).findIndex(m => m.uid === userData.uid) + 1}
             </div>
          </div>
          <div className="text-center px-6">
             <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Room Members</div>
             <div className="text-2xl font-black text-indigo-900">{members.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
