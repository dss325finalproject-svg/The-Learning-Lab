import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, User as UserIcon } from 'lucide-react';
import { db, collection, query, orderBy, limit, onSnapshot } from '../lib/firebase';

export default function AppLeaderboard({ currentUserId }: { currentUserId: string }) {
  const [leaders, setLeaders] = useState<any[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'leaderboard'), orderBy('totalStudyTime', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaders(data);
    });
    return () => unsubscribe();
  }, []);
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-stone-800">Leaderboard</h2>
      <Card className="border-slate-200 shadow-xl overflow-hidden">
        <CardHeader className="bg-primary text-white pb-8"><div className="flex items-center gap-3"><Trophy className="h-8 w-8 text-yellow-400" /><CardTitle className="text-2xl">Top study time</CardTitle></div></CardHeader>
        <CardContent className="p-0 -mt-4"><div className="bg-white rounded-t-3xl p-4 space-y-2">
            {leaders.map((leader, index) => (
              <div key={leader.id} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${leader.id === currentUserId ? 'bg-brand-50 ring-1 ring-brand-50' : 'hover:bg-slate-50'}`}>
                <div className="w-8 flex justify-center font-bold text-slate-400">{index === 0 ? <Medal className="h-6 w-6 text-yellow-500" /> : index === 1 ? <Medal className="h-6 w-6 text-slate-400" /> : index === 2 ? <Medal className="h-6 w-6 text-amber-600" /> : index + 1}</div>
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm"><AvatarImage src={leader.photoURL} /><AvatarFallback><UserIcon /></AvatarFallback></Avatar>
                <div className="flex-1"><p className="font-bold text-slate-900">{leader.displayName}{leader.id === currentUserId && <Badge variant="secondary" className="ml-2 bg-brand-50 text-primary">You</Badge>}</p></div>
                <div className="text-right"><p className="font-mono font-bold text-primary">{formatTime(leader.totalStudyTime || 0)}</p></div>
              </div>
            ))}
          </div></CardContent>
      </Card>
    </div>
  );
}
