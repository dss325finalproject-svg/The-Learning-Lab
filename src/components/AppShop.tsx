import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Check, Sparkles, Trophy } from 'lucide-react';
import { db, doc, updateDoc } from '../lib/firebase';
import { toast } from 'sonner';

const SHOP_CATEGORIES = [
  { id: 'all', name: 'All Items', icon: <ShoppingBag className="h-4 w-4" /> },
  { id: 'base', name: 'Buddies', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'hat', name: 'Headwear', icon: <div className="h-4 w-4 rounded-full border-2 border-current" /> },
  { id: 'outfit', name: 'Clothing', icon: <div className="h-4 w-4 bg-current rounded-sm" /> },
  { id: 'accessory', name: 'Accessories', icon: <div className="h-4 w-4 border-b-2 border-current" /> },
];

const SHOP_ITEMS = [
  // Animals (Bases)
  { id: 'bear', name: 'Bear Chum', price: 0, category: 'base', color: 'bg-[#FDF5EC]', description: 'A reliable study companion.' },
  { id: 'tiger', name: 'Tiger Scout', price: 50, category: 'base', color: 'bg-[#FFFBE6]', description: 'For the brave explorers.' },
  { id: 'koala', name: 'Koala Calm', price: 75, category: 'base', color: 'bg-[#F4F7FA]', description: 'Keeps focus steady and slow.' },
  { id: 'cat', name: 'Cat Meow', price: 30, category: 'base', color: 'bg-[#FAF3EC]', description: 'Always curious about learning.' },
  { id: 'bird', name: 'Sky Bird', price: 20, category: 'base', color: 'bg-[#FFFBE6]', description: 'A lightweight study buddy.' },
  { id: 'rooster', name: 'Early Rooster', price: 40, category: 'base', color: 'bg-[#FFF5F5]', description: 'Perfect for morning sessions.' },
  { id: 'pony', name: 'Pony Runner', price: 90, category: 'base', color: 'bg-[#FAF3EC]', description: 'Gallops through assignments.' },
  { id: 'deer', name: 'Forest Deer', price: 110, category: 'base', color: 'bg-[#FAF3EC]', description: 'A graceful focus partner.' },
  { id: 'fox', name: 'Clever Fox', price: 150, category: 'base', color: 'bg-orange-50', description: 'Smart and quick to learn.' },
  { id: 'rabbit', name: 'Bunny Hop', price: 60, category: 'base', color: 'bg-pink-50', description: 'Bouncing with focus energy.' },

  // Hats (Headwear)
  { id: 'beret', name: 'Artist Beret', price: 40, category: 'hat', color: 'bg-red-400', description: 'For creative thinking.' },
  { id: 'scarf', name: 'Warm Scarf', price: 60, category: 'hat', color: 'bg-blue-300', description: 'Cozy focus vibes.' },
  { id: 'crown', name: 'Scholar Crown', price: 200, category: 'hat', color: 'bg-yellow-400', description: 'The peak of academic achievement.' },
  { id: 'beanie', name: 'Chill Beanie', price: 30, category: 'hat', color: 'bg-slate-700', description: 'Relaxed study sessions.' },
  { id: 'headphones', name: 'Focus Buds', price: 80, category: 'hat', color: 'bg-indigo-500', description: 'Block out all distractions.' },
  { id: 'wizard', name: 'Wisdom Hat', price: 120, category: 'hat', color: 'bg-purple-600', description: 'Magical concentration boost.' },
  { id: 'cap', name: 'Sporty Cap', price: 25, category: 'hat', color: 'bg-emerald-500', description: 'Ready for a study sprint.' },

  // Clothing (Outfits)
  { id: 'sweatshirt', name: 'Cozy Hoodie', price: 45, category: 'outfit', color: 'bg-indigo-100', description: 'Maximum comfort for reading.' },
  { id: 'suit', name: 'Logic Suit', price: 150, category: 'outfit', color: 'bg-slate-800', description: 'Professional study mode.' },
  { id: 'cape', name: 'Hero Cape', price: 100, category: 'outfit', color: 'bg-red-500', description: 'Save the day with productivity.' },
  { id: 'overall', name: 'Craft Overalls', price: 70, category: 'outfit', color: 'bg-blue-600', description: 'Work hard on every quest.' },
  { id: 'vest', name: 'Safari Vest', price: 55, category: 'outfit', color: 'bg-amber-100', description: 'Ready for a research trip.' },
  { id: 'kimono', name: 'Zen Robe', price: 90, category: 'outfit', color: 'bg-emerald-100', description: 'Peaceful and calm learning.' },

  // Accessories (Items)
  { id: 'glasses', name: 'Reading Glasses', price: 30, category: 'accessory', color: 'bg-slate-300', description: 'See the facts clearly.' },
  { id: 'pencil', name: 'Sketch Pencil', price: 20, category: 'accessory', color: 'bg-yellow-200', description: 'Note-taking essential.' },
  { id: 'book', name: 'Old Tome', price: 50, category: 'accessory', color: 'bg-amber-800', description: 'Classic wisdom item.' },
  { id: 'star', name: 'Shining Star', price: 300, category: 'accessory', color: 'bg-yellow-200', description: 'A mark of true brilliance.' },
  { id: 'lamp', name: 'Smart Lamp', price: 65, category: 'accessory', color: 'bg-orange-300', description: 'Lights up late night sessions.' },
  { id: 'globe', name: 'Study Globe', price: 110, category: 'accessory', color: 'bg-blue-400', description: 'For world-class learners.' },
  { id: 'coffee', name: 'Energy Mug', price: 40, category: 'accessory', color: 'bg-amber-900', description: 'A quick boost of focus.' },
];

import AppAnimalFigure from './AppAnimalFigure';

export default function AppShop({ userData }: { userData: any }) {
  const [buying, setBuying] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const handleBuy = async (item: any) => {
    if (!userData || (userData.points || 0) < item.price) { toast.error("Not enough points."); return; }
    setBuying(item.id);
    try {
      const userRef = doc(db, 'users', userData.uid);
      const newInventory = [...(userData.inventory || []), item.id];
      const newCharacter = { ...userData.character, [item.category]: item.id };
      await updateDoc(userRef, { points: userData.points - item.price, inventory: newInventory, character: newCharacter });
      toast.success(`${item.name} added to inventory.`);
    } catch (error) { toast.error("Purchase failed."); } finally { setBuying(null); }
  };

  const handleEquip = async (item: any) => {
    if (!userData) return;
    try {
      const userRef = doc(db, 'users', userData.uid);
      const newCharacter = { ...userData.character, [item.category]: item.id };
      await updateDoc(userRef, { character: newCharacter });
      toast.info(`${item.name} equipped.`);
    } catch (error) { console.error(error); }
  };

  const filteredItems = SHOP_ITEMS.filter(item => activeCategory === 'all' || item.category === activeCategory);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2">Quest Shop</h2>
          <p className="text-slate-500 font-medium italic">Equip your buddy for success.</p>
        </div>
        <div className="flex items-center gap-3 bg-yellow-50 px-6 py-3 rounded-2xl border-2 border-yellow-100 shadow-sm">
          <Badge variant="outline" className="text-xl font-black border-none p-0 text-yellow-700 bg-transparent">{userData?.points || 0}</Badge>
          <span className="text-xs font-bold uppercase tracking-widest text-yellow-600">Points</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
        {SHOP_CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? 'default' : 'ghost'}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-xl h-10 px-5 font-bold transition-all ${activeCategory === cat.id ? 'shadow-md ring-2 ring-primary/20' : 'text-slate-500'}`}
          >
            <span className="mr-2">{cat.icon}</span>
            {cat.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const isOwned = userData?.inventory?.includes(item.id);
          const isEquipped = userData?.character?.[item.category] === item.id;
          return (
            <Card key={item.id} className="group overflow-hidden border-2 border-slate-100 transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 rounded-[2rem]">
              <div className={`h-40 ${item.color} flex items-center justify-center relative p-6 overflow-hidden`}>
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-[size:10px_10px]" />
                {item.category === 'base' ? (
                  <div className="w-24 h-24 transform group-hover:scale-110 transition-transform drop-shadow-lg">
                    <AppAnimalFigure type={item.id as any} expression="happy" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      {item.category === 'hat' && <Sparkles className="h-8 w-8 text-amber-500" />}
                      {item.category === 'outfit' && <ShoppingBag className="h-8 w-8 text-primary" />}
                      {item.category === 'accessory' && <Trophy className="h-8 w-8 text-indigo-500" />}
                    </div>
                  </div>
                )}
                {!isOwned && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-slate-800 border-2 border-slate-100">
                      NEW
                    </div>
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">{item.category}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-tight pt-2 line-clamp-2">{item.description}</p>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-sm font-black text-slate-800">{item.price} pts</span>
                    {isOwned && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">In Stock</span>}
                  </div>
                  {isOwned ? (
                    <Button 
                      variant={isEquipped ? "secondary" : "outline"} 
                      className={`w-full rounded-2xl h-10 font-bold transition-all ${isEquipped ? 'opacity-70 bg-slate-100 border-slate-200' : 'hover:bg-primary/5 hover:text-primary hover:border-primary/30'}`} 
                      onClick={() => handleEquip(item)} 
                      disabled={isEquipped}
                    >
                      {isEquipped ? <><Check className="mr-2 h-4 w-4" /> Equipped</> : 'Equip Piece'}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full rounded-2xl h-10 font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 active:scale-95 transition-all" 
                      onClick={() => handleBuy(item)} 
                      disabled={buying === item.id}
                    >
                      {buying === item.id ? 'Acquiring...' : 'Unlock'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
