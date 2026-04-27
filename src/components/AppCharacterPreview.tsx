import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, Trophy, Crown, Headphones, Wand2, GraduationCap, Shirt, Stars, Glasses, Pen, Book, Lamp, Globe, Coffee, Heart } from 'lucide-react';
import AppAnimalFigure, { AnimalType, ExpressionType } from './AppAnimalFigure';

interface CharacterProps { 
  character?: { 
    base: string; 
    hat: string; 
    outfit: string; 
    accessory: string;
    expression?: ExpressionType;
  }; 
  size?: 'sm' | 'md' | 'lg'; 
  expressionOverride?: ExpressionType;
}

const getItemIcon = (id: string, category: string) => {
  switch (id) {
    case 'crown': return <Crown className="h-4 w-4 text-white" />;
    case 'headphones': return <Headphones className="h-4 w-4 text-white" />;
    case 'wizard': return <Wand2 className="h-4 w-4 text-white" />;
    case 'cap': return <GraduationCap className="h-4 w-4 text-white" />;
    case 'suit': return <Shirt className="h-4 w-4 text-white" />;
    case 'cape': return <Stars className="h-4 w-4 text-white" />;
    case 'glasses': return <Glasses className="h-4 w-4 text-white" />;
    case 'pencil': return <Pen className="h-4 w-4 text-white" />;
    case 'book': return <Book className="h-4 w-4 text-white" />;
    case 'star': return <Sparkles className="h-4 w-4 text-white" />;
    case 'lamp': return <Lamp className="h-4 w-4 text-white" />;
    case 'globe': return <Globe className="h-4 w-4 text-white" />;
    case 'coffee': return <Coffee className="h-4 w-4 text-white" />;
    default:
      if (category === 'hat') return <Sparkles className="h-4 w-4 text-white" />;
      if (category === 'outfit') return <Zap className="h-4 w-4 text-white" />;
      return <Trophy className="h-4 w-4 text-white" />;
  }
};

const getItemColor = (id: string, category: string) => {
  switch (id) {
    case 'crown': return 'bg-yellow-400';
    case 'headphones': return 'bg-indigo-500';
    case 'wizard': return 'bg-purple-600';
    case 'suit': return 'bg-slate-800';
    case 'cape': return 'bg-red-500';
    case 'star': return 'bg-yellow-300';
    case 'coffee': return 'bg-amber-900';
    default:
      if (category === 'hat') return 'bg-amber-400';
      if (category === 'outfit') return 'bg-primary';
      return 'bg-indigo-500';
  }
};

export default function AppCharacterPreview({ character, size = 'md', expressionOverride }: CharacterProps) {
  const dimensions = { sm: 'h-24 w-24', md: 'h-48 w-48', lg: 'h-64 w-64' };
  const figureSizes = { sm: 'w-20 h-20', md: 'w-40 h-40', lg: 'w-56 h-56' };
  
  const validAnimals: AnimalType[] = [
    'bear', 'tiger', 'koala', 'cat', 'bird', 'rooster', 
    'pony', 'deer', 'fox', 'rabbit'
  ];
  const animalType = validAnimals.includes(character?.base as AnimalType) ? (character?.base as AnimalType) : 'bear';
  const currentExpression = expressionOverride || character?.expression || 'neutral';

  return (
    <div className={`relative flex items-center justify-center rounded-3xl overflow-hidden border-2 border-border shadow-md transition-all duration-500 ${dimensions[size]}`}>
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-[size:10px_10px]" />
      
      <motion.div 
        animate={{ 
          y: [0, -4, 0],
          rotate: currentExpression === 'excited' ? [-1, 1, -1] : 0
        }} 
        transition={{ 
          duration: currentExpression === 'excited' ? 0.5 : 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }} 
        className="relative z-10"
      >
        <div className={`transform transition-transform hover:scale-105 ${figureSizes[size]}`}>
          <motion.div
            whileTap={{ scale: 0.9, y: 5 }}
            className="cursor-pointer"
          >
            <AppAnimalFigure 
              type={animalType} 
              expression={currentExpression}
              className="w-full h-full drop-shadow-xl"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Accessories */}
      <AnimatePresence>
        {character?.hat && character.hat !== 'none' && (
          <motion.div 
            initial={{ scale: 0, y: 20 }} 
            animate={{ scale: 1, y: size === 'sm' ? -25 : -50 }} 
            className="absolute z-20 top-1/2"
          >
            <div className={`${getItemColor(character.hat, 'hat')} p-1.5 rounded-xl border-2 border-white shadow-lg`}>
              {getItemIcon(character.hat, 'hat')}
            </div>
          </motion.div>
        )}

        {character?.outfit && character.outfit !== 'none' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="absolute bottom-4 z-10"
          >
            <div className={`${getItemColor(character.outfit, 'outfit')}/90 backdrop-blur-sm px-3 py-1 rounded-full text-[8.5px] font-black text-white uppercase tracking-[0.2em] border border-white/20 shadow-lg`}>
              {character.outfit.replace('-', ' ')}
            </div>
          </motion.div>
        )}

        {character?.accessory && character.accessory !== 'none' && (
          <motion.div 
            initial={{ x: 20, opacity: 0 }} 
            animate={{ x: size === 'sm' ? 25 : 50, opacity: 1 }} 
            className="absolute z-20"
          >
            <div className={`${getItemColor(character.accessory, 'accessory')} p-1.5 rounded-full border-2 border-white shadow-md`}>
              {getItemIcon(character.accessory, 'accessory')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { AnimatePresence } from 'motion/react';
