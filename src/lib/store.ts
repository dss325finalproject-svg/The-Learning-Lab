import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Item {
  id: string;
  name: string;
  price: number;
  type: 'head' | 'body' | 'accessory' | 'background';
  image: string;
}

export const SHOP_ITEMS: Item[] = [
  { id: 'hat-1', name: 'Graduation Cap', price: 100, type: 'head', image: '🎓' },
  { id: 'hat-2', name: 'Wizard Hat', price: 250, type: 'head', image: '🧙' },
  { id: 'hat-3', name: 'Crown', price: 500, type: 'head', image: '👑' },
  { id: 'acc-1', name: 'Glasses', price: 50, type: 'accessory', image: '👓' },
  { id: 'acc-2', name: 'Book', price: 150, type: 'accessory', image: '📖' },
  { id: 'acc-3', name: 'Coffee', price: 75, type: 'accessory', image: '☕' },
  { id: 'bg-1', name: 'Library', price: 300, type: 'background', image: '🏛️' },
  { id: 'bg-2', name: 'Forest', price: 400, type: 'background', image: '🌲' },
];

interface UserState {
  points: number;
  totalStudyTime: number;
  inventory: string[];
  equipped: {
    head: string | null;
    body: string | null;
    accessory: string | null;
    background: string | null;
  };
  addPoints: (amount: number) => void;
  addStudyTime: (seconds: number) => void;
  buyItem: (item: Item) => boolean;
  equipItem: (item: Item) => void;
}

export const useStore = create<UserState>()(
  persist(
    (set, get) => ({
      points: 0,
      totalStudyTime: 0,
      inventory: [],
      equipped: {
        head: null,
        body: null,
        accessory: null,
        background: null,
      },
      addPoints: (amount) => set((state) => ({ points: state.points + amount })),
      addStudyTime: (seconds) => set((state) => ({ totalStudyTime: state.totalStudyTime + seconds })),
      buyItem: (item) => {
        const state = get();
        if (state.points >= item.price && !state.inventory.includes(item.id)) {
          set((state) => ({
            points: state.points - item.price,
            inventory: [...state.inventory, item.id],
          }));
          return true;
        }
        return false;
      },
      equipItem: (item) => set((state) => ({
        equipped: {
          ...state.equipped,
          [item.type]: state.equipped[item.type] === item.id ? null : item.id
        }
      })),
    }),
    {
      name: 'study-buddy-storage',
    }
  )
);
