import React from 'react';
import { motion } from 'motion/react';

export type AnimalType = 
  | 'bear' | 'tiger' | 'koala' 
  | 'cat' | 'bird' | 'rooster' | 'pony' | 'deer' | 'fox' | 'rabbit';

export type ExpressionType = 'neutral' | 'happy' | 'focus' | 'tired' | 'excited';

interface AppAnimalFigureProps {
  type: AnimalType;
  expression?: ExpressionType;
  className?: string;
}

const animalConfig: Record<AnimalType, { primary: string; secondary: string; bg: string; stroke: string }> = {
  bear: { primary: '#A27045', secondary: '#F4D4B5', bg: '#FDF5EC', stroke: '#4B2E1D' },
  tiger: { primary: '#FFEB85', secondary: '#FFFFFF', bg: '#FFFBE6', stroke: '#4B2E1D' },
  koala: { primary: '#9FA8B8', secondary: '#FADADD', bg: '#F4F7FA', stroke: '#4B2E1D' },
  cat: { primary: '#C08552', secondary: '#F3E5D8', bg: '#FAF3EC', stroke: '#4B2E1D' },
  bird: { primary: '#FFEB85', secondary: '#FFFFFF', bg: '#FFFBE6', stroke: '#4B2E1D' },
  rooster: { primary: '#FFFFFF', secondary: '#EE4444', bg: '#FFF5F5', stroke: '#4B2E1D' },
  pony: { primary: '#91613D', secondary: '#F2D3B8', bg: '#FAF3EC', stroke: '#4B2E1D' },
  deer: { primary: '#BC8A5F', secondary: '#FFFFFF', bg: '#FAF3EC', stroke: '#4B2E1D' },
  fox: { primary: '#E67E22', secondary: '#FFFFFF', bg: '#FEF9E7', stroke: '#4B2E1D' },
  rabbit: { primary: '#FADADD', secondary: '#FFFFFF', bg: '#FEF5F7', stroke: '#4B2E1D' },
};

export default function AppAnimalFigure({ 
  type, 
  expression = 'neutral', 
  className = "" 
}: AppAnimalFigureProps) {
  const config = animalConfig[type] || animalConfig.bear;
  const { primary, secondary, bg, stroke } = config;

  const renderFeatures = () => {
    switch (type) {
      case 'bear':
        return (
          <g>
            <path d="M50 20 Q85 25 85 55 Q85 85 50 90 Q15 85 15 55 Q15 25 50 20Z" fill={primary} stroke={stroke} strokeWidth="3" />
            <path d="M 18 38 Q 28 12 42 28 Z" fill={primary} stroke={stroke} strokeWidth="3" />
            <path d="M 82 38 Q 72 12 58 28 Z" fill={primary} stroke={stroke} strokeWidth="3" />
            <path d="M 22 36 Q 28 18 36 28 Z" fill={secondary} />
            <path d="M 78 36 Q 72 18 64 28 Z" fill={secondary} />
            <ellipse cx="50" cy="70" rx="20" ry="15" fill={secondary} stroke={stroke} strokeWidth="1.5" />
          </g>
        );
      case 'tiger':
        return (
          <g>
            <path d="M50 18 Q85 22 85 55 Q85 85 50 90 Q15 85 15 55 Q15 22 50 18Z" fill={primary} stroke={stroke} strokeWidth="3" />
            <path d="M 18 38 Q 28 12 42 28 Z" fill={primary} stroke={stroke} strokeWidth="3" />
            <path d="M 82 38 Q 72 12 58 28 Z" fill={primary} stroke={stroke} strokeWidth="3" />
            <path d="M 22 36 Q 28 18 36 28 Z" fill={secondary} />
            <path d="M 78 36 Q 72 18 64 28 Z" fill={secondary} />
            <path d="M45 18 L45 28 M50 18 L50 32 M55 18 L55 28" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M15 50 L30 55 M15 65 L28 62" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M85 50 L70 55 M85 65 L72 62" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="50" cy="72" rx="15" ry="10" fill="#FFFFFF" stroke={stroke} strokeWidth="1.5" />
          </g>
        );
      case 'koala':
        return (
          <g>
            <path d="M50 25 Q82 30 82 55 Q82 85 50 90 Q18 85 18 55 Q18 30 50 25Z" fill={primary} stroke={stroke} strokeWidth="3" />
            <circle cx="21" cy="45" r="10" fill={primary} stroke={stroke} strokeWidth="3" />
            <circle cx="79" cy="45" r="10" fill={primary} stroke={stroke} strokeWidth="3" />
            <circle cx="21" cy="45" r="5" fill={secondary} />
            <circle cx="79" cy="45" r="5" fill={secondary} />
            <ellipse cx="50" cy="58" rx="10" ry="15" fill="#424242" stroke={stroke} strokeWidth="1" />
          </g>
        );
      case 'cat':
        return (
          <g>
            <path d="M50 20 Q85 25 85 55 Q85 85 50 90 Q15 85 15 55 Q15 25 50 20Z" fill={primary} stroke={stroke} strokeWidth="3" />
            <path d="M 20 38 Q 32 10 48 35 Z" fill={primary} stroke={stroke} strokeWidth="3" />
            <path d="M 80 38 Q 68 10 52 35 Z" fill={primary} stroke={stroke} strokeWidth="3" />
            <path d="M 26 36 Q 32 18 40 34 Z" fill={secondary} />
            <path d="M 74 36 Q 68 18 60 34 Z" fill={secondary} />
            <path d="M42 22 L58 22 M45 28 L55 28 M48 34 L52 34" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <ellipse cx="50" cy="72" rx="15" ry="10" fill={secondary} stroke={stroke} strokeWidth="1.5" />
            <g stroke={stroke} strokeWidth="1" opacity="0.6">
              <line x1="22" y1="65" x2="10" y2="60" /><line x1="22" y1="70" x2="10" y2="70" /><line x1="22" y1="75" x2="10" y2="80" />
              <line x1="78" y1="65" x2="90" y2="60" /><line x1="78" y1="70" x2="90" y2="70" /><line x1="78" y1="75" x2="90" y2="80" />
            </g>
          </g>
        );
      case 'bird':
        return (
          <g>
            <circle cx="50" cy="55" r="40" fill={primary} stroke={stroke} strokeWidth="3" />
            <path d="M48 20 Q50 5 55 20" fill={primary} stroke={stroke} strokeWidth="2.5" />
            <ellipse cx="50" cy="65" rx="10" ry="6" fill="#F9B34C" stroke={stroke} strokeWidth="2" />
          </g>
        );
      case 'rooster':
        return (
          <g>
            <circle cx="50" cy="65" r="35" fill="#FFFFFF" stroke={stroke} strokeWidth="3" />
            <path d="M50 35 Q40 10 50 20 Q60 10 50 35" fill="#EE4444" stroke={stroke} strokeWidth="2.5" />
            <path d="M45 68 L50 78 L55 68 Z" fill="#F9B34C" stroke={stroke} strokeWidth="2" />
            <path d="M47 80 Q50 88 53 80" fill="#EE4444" />
          </g>
        );
      case 'pony':
        return (
          <g>
            <ellipse cx="50" cy="55" rx="35" ry="40" fill={primary} stroke={stroke} strokeWidth="3" />
            <path d="M30 35 L25 15 L40 30 Z" fill="#F2D3B8" stroke={stroke} strokeWidth="2.5" />
            <path d="M70 35 L75 15 L60 30 Z" fill="#F2D3B8" stroke={stroke} strokeWidth="2.5" />
            <path d="M38 15 Q50 5 62 18 L60 40 L40 40 Z" fill="#6D432A" stroke={stroke} strokeWidth="1.5" />
            <ellipse cx="50" cy="80" rx="28" ry="18" fill="#F2D3B8" stroke={stroke} strokeWidth="2" />
            <circle cx="45" cy="78" r="1.5" fill={stroke} />
            <circle cx="55" cy="78" r="1.5" fill={stroke} />
          </g>
        );
      case 'deer':
        return (
          <g>
            <path d="M50 25 Q82 30 82 60 Q82 90 50 95 Q18 90 18 60 Q18 30 50 25Z" fill={primary} stroke={stroke} strokeWidth="3" />
            <path d="M35 22 L28 10 M32 15 L35 8" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M65 22 L72 10 M68 15 L65 8" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M18 55 Q30 75 50 75 Q70 75 82 55 L82 80 Q50 95 18 80 Z" fill={secondary} />
            <ellipse cx="50" cy="82" rx="6" ry="4" fill={stroke} />
          </g>
        );
      case 'fox':
        return (
          <g>
            <path d="M50 22 Q90 25 85 60 Q80 90 50 95 Q20 90 15 60 Q10 25 50 22Z" fill={primary} stroke={stroke} strokeWidth="3" />
            <path d="M 15 35 L 5 10 L 35 30 Z" fill={primary} stroke={stroke} strokeWidth="3" />
            <path d="M 85 35 L 95 10 L 65 30 Z" fill={primary} stroke={stroke} strokeWidth="3" />
            <path d="M 12 25 L 8 15 L 20 25 Z" fill="#FFFFFF" />
            <path d="M 88 25 L 92 15 L 80 25 Z" fill="#FFFFFF" />
            <path d="M15 55 Q30 85 50 85 Q70 85 85 55 L80 85 Q50 98 20 85 Z" fill="#FFFFFF" />
            <ellipse cx="50" cy="80" rx="5" ry="3" fill={stroke} />
          </g>
        );
      case 'rabbit':
        return (
          <g>
            <ellipse cx="50" cy="65" rx="35" ry="32" fill={primary} stroke={stroke} strokeWidth="3" />
            <ellipse cx="32" cy="30" rx="10" ry="25" fill={primary} stroke={stroke} strokeWidth="2.5" transform="rotate(-10 32 30)" />
            <ellipse cx="68" cy="30" rx="10" ry="25" fill={primary} stroke={stroke} strokeWidth="2.5" transform="rotate(10 68 30)" />
            <ellipse cx="32" cy="30" rx="4" ry="15" fill={secondary} transform="rotate(-10 32 30)" />
            <ellipse cx="68" cy="30" rx="4" ry="15" fill={secondary} transform="rotate(10 68 30)" />
            <ellipse cx="50" cy="82" rx="12" ry="8" fill={secondary} stroke={stroke} strokeWidth="1" />
            <path d="M48 78 L50 82 L52 78" stroke={stroke} strokeWidth="1.5" fill="none" />
          </g>
        );
      default:
        return null;
    }
  };

  const renderEyes = () => {
    switch (expression) {
      case 'happy':
      case 'excited':
        return (
          <g>
            <path d="M28 55 Q35 48 42 55" stroke={stroke} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M58 55 Q65 48 72 55" stroke={stroke} strokeWidth="3" fill="none" strokeLinecap="round" />
            {expression === 'excited' && (
              <g>
                <circle cx="35" cy="55" r="1.5" fill="white" />
                <circle cx="65" cy="55" r="1.5" fill="white" />
              </g>
            )}
          </g>
        );
      case 'focus':
        return (
          <g>
            <path d="M28 53 L42 53" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
            <path d="M58 53 L72 53" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="35" cy="58" r="3" fill={stroke} />
            <circle cx="65" cy="58" r="3" fill={stroke} />
          </g>
        );
      case 'tired':
        return (
          <g>
            <path d="M28 58 Q35 65 42 58" stroke={stroke} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M58 58 Q65 65 72 58" stroke={stroke} strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );
      default:
        return (
          <g>
            <circle cx="35" cy="55" r="3.5" fill={stroke} />
            <circle cx="65" cy="55" r="3.5" fill={stroke} />
          </g>
        );
    }
  };

  const renderMouth = () => {
    if (['bird', 'rooster'].includes(type)) return null;
    
    switch (expression) {
      case 'happy':
        return <path d="M40 76 Q50 85 60 76" stroke={stroke} strokeWidth="3" fill="none" strokeLinecap="round" />;
      case 'excited':
        return <path d="M40 76 Q50 90 60 76 Z" fill="#EE4444" stroke={stroke} strokeWidth="2.5" />;
      case 'tired':
        return <path d="M44 78 Q50 74 56 78" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />;
      case 'focus':
        return <line x1="44" y1="78" x2="56" y2="78" stroke={stroke} strokeWidth="3" strokeLinecap="round" />;
      default:
        return <path d="M45 76 Q50 80 55 76" stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    }
  };

  const renderBlush = () => {
    return (
      <g>
        <circle cx="25" cy={70} r="6" fill="#F3A7B9" opacity="0.6" />
        <circle cx="75" cy={70} r="6" fill="#F3A7B9" opacity="0.6" />
      </g>
    );
  };

  return (
    <div className={`relative flex items-center justify-center rounded-3xl overflow-hidden ${className}`} style={{ backgroundColor: bg }}>
      <svg viewBox="0 0 100 110" style={{ width: '85%', height: '85%' }}>
        {renderFeatures()}
        {renderBlush()}
        {renderEyes()}
        {renderMouth()}
      </svg>
    </div>
  );
}
