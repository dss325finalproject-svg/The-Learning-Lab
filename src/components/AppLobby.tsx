import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Plus, 
  LogIn, 
  Lock, 
  RefreshCcw, 
  DoorOpen, 
  Search,
  BookOpen,
  ArrowRight,
  Trophy,
  User as UserIcon,
  HelpCircle
} from 'lucide-react';
import { db, collection, query, onSnapshot, addDoc, serverTimestamp, doc, setDoc, orderBy } from '../lib/firebase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface AppLobbyProps {
  userData: any;
  onJoinRoom: (roomId: string) => void;
}

export default function AppLobby({ userData, onJoinRoom }: AppLobbyProps) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  
  // Create Room State
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPassword, setNewRoomPassword] = useState('');
  const [isRandomPassword, setIsRandomPassword] = useState(false);

  // Join Room State
  const [joinPassword, setJoinPassword] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'rooms'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRooms(roomList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewRoomPassword(result);
    setIsRandomPassword(true);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName || !newRoomPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (newRoomPassword.length > 10) {
      toast.error("Password must be 10 characters or less");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'rooms'), {
        name: newRoomName,
        password: newRoomPassword,
        creatorId: userData.uid,
        createdAt: serverTimestamp(),
      });
      
      toast.success("Room created.");
      setShowCreateModal(false);
      setNewRoomName('');
      setNewRoomPassword('');
      onJoinRoom(docRef.id);
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create room");
    }
  };

  const handleJoinRoom = (room: any) => {
    if (joinPassword === room.password) {
      toast.success(`Joined ${room.name}.`);
      onJoinRoom(room.id);
    } else {
      toast.error("Incorrect password");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Header section with Create Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border-4 border-slate-100">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-800">
            <BookOpen className="w-8 h-8 text-indigo-500" />
            Study rooms
          </h1>
          <p className="text-slate-500 mt-1">Join a room.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowHelp(true)}
            className="rounded-full w-12 h-12 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50"
          >
            <HelpCircle className="w-6 h-6" />
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="rounded-full px-8 py-6 text-lg bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-200"
          >
            <Plus className="w-6 h-6 mr-2" />
            New Room
          </Button>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-3xl" />
            ))
          ) : rooms.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-400 bg-white/30 rounded-3xl border-4 border-dashed border-slate-200">
              <DoorOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl font-medium">No rooms yet.</p>
              <p>Be the first to make one.</p>
            </div>
          ) : (
            rooms.map((room) => (
              <motion.div
                key={room.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
              >
                <Card className="rounded-3xl border-4 border-slate-100 hover:border-indigo-100 transition-colors shadow-sm overflow-hidden">
                  <CardHeader className="bg-slate-50/50 pb-4">
                    <CardTitle className="text-xl flex items-center justify-between">
                      <span className="truncate">{room.name}</span>
                      <div className="p-2 bg-white rounded-xl">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                       <Users className="w-4 h-4" />
                       Private Room
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Button 
                      onClick={() => setShowJoinModal(room.id)}
                      variant="outline"
                      className="w-full rounded-2xl py-6 border-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 group"
                    >
                      Join Room
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <HelpCircle className="w-7 h-7 text-indigo-500" />
                Quick-Start Guide
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowHelp(false)} className="rounded-full">
                <RefreshCcw className="w-5 h-5 rotate-45 text-slate-400" />
              </Button>
            </div>

            <div className="grid gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                  <LogIn className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700">Enter</h4>
                  <p className="text-slate-500 text-sm">Create a room or type in a friend’s Room Password to join.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <RefreshCcw className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700">Interact</h4>
                  <p className="text-slate-500 text-sm">Stay active in the room space to earn Points and collaborate.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700">Compete</h4>
                  <p className="text-slate-500 text-sm">Check the Leaderboard to see how you rank against others in the room.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700">Profile</h4>
                  <p className="text-slate-500 text-sm">Customize your Character in the Shop to show off your progress!</p>
                </div>
              </div>
            </div>

            <Button onClick={() => setShowHelp(false)} className="w-full rounded-2xl py-6 bg-slate-800 hover:bg-slate-900">
              Done
            </Button>
          </motion.div>
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">New space</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)} className="rounded-full">
                  <RefreshCcw className="w-5 h-5 rotate-45 text-slate-400" />
                </Button>
              </div>
              
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-name" className="text-slate-600 ml-1">Room Name</Label>
                  <Input 
                    id="room-name"
                    placeholder="E.g., Physics Deep Dive"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="rounded-2xl py-6 border-2 focus:ring-indigo-500"
                    maxLength={30}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <Label htmlFor="room-password" className="text-slate-600">Password</Label>
                    <button 
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-xs font-medium text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                    >
                      <RefreshCcw className="w-3 h-3" />
                      Generate Random
                    </button>
                  </div>
                  <Input 
                    id="room-password"
                    placeholder="Max 10 chars"
                    value={newRoomPassword}
                    onChange={(e) => {
                      setNewRoomPassword(e.target.value);
                      setIsRandomPassword(false);
                    }}
                    className="rounded-2xl py-6 border-2 focus:ring-indigo-500 font-mono tracking-wider"
                    maxLength={10}
                  />
                  {isRandomPassword && (
                    <p className="text-[10px] text-indigo-400 mt-1 ml-1">Random password generated. Save it!</p>
                  )}
                </div>

                <Button type="submit" className="w-full rounded-2xl py-7 text-lg bg-indigo-500 shadow-lg shadow-indigo-100 hover:bg-indigo-600 mt-4 transition-all active:scale-95">
                  Confirm & Create
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 space-y-6 text-center">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-10 h-10 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Enter the password</h2>
                <p className="text-slate-500 text-sm mt-1">Type the password to go in.</p>
              </div>
              
              <div className="space-y-4">
                <Input 
                  type="password"
                  placeholder="Secret password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const room = rooms.find(r => r.id === showJoinModal);
                      if (room) handleJoinRoom(room);
                    }
                  }}
                  className="rounded-2xl py-6 border-2 focus:ring-indigo-500 text-center text-xl tracking-widest"
                  autoFocus
                />
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowJoinModal(null);
                      setJoinPassword('');
                    }}
                    className="flex-1 rounded-2xl py-6"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      const room = rooms.find(r => r.id === showJoinModal);
                      if (room) handleJoinRoom(room);
                    }}
                    className="flex-1 rounded-2xl py-6 bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-100"
                  >
                    Join
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
