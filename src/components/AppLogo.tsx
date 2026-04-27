import React from 'react';
import { motion } from 'motion/react';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function AppLogo({ className, size = 'md' }: AppLogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32'
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Light Rays */}
        <motion.g
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <line x1="50" y1="5" x2="50" y2="15" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
          <line x1="25" y1="15" x2="35" y2="25" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
          <line x1="75" y1="15" x2="65" y2="25" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
        </motion.g>

        {/* Stars */}
        {/* Left Star */}
        <motion.path
          d="M18 15L20 22L27 24L20 26L18 33L16 26L9 24L16 22L18 15Z"
          fill="#FACC15"
          stroke="#1F2937"
          strokeWidth="1.5"
          strokeLinejoin="round"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Center Star */}
        <motion.path
          d="M50 15L53 23L61 25L53 27L50 35L47 27L39 25L47 23L50 15Z"
          fill="#FACC15"
          stroke="#1F2937"
          strokeWidth="1.5"
          strokeLinejoin="round"
          animate={{ scale: [1.1, 1, 1.1], rotate: [0, -5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        {/* Right Star */}
        <motion.path
          d="M82 15L84 22L91 24L84 26L82 33L80 26L73 24L80 22L82 15Z"
          fill="#FACC15"
          stroke="#1F2937"
          strokeWidth="1.5"
          strokeLinejoin="round"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />

        {/* Red Outer Cover */}
        <rect x="10" y="42" width="80" height="48" rx="6" fill="#EF4444" stroke="#1F2937" strokeWidth="2.5" />
        {/* Center Notch in Cover */}
        <path d="M42 88C42 92.4183 45.5817 96 50 96C54.4183 96 58 92.4183 58 88" stroke="#1F2937" strokeWidth="2.5" fill="#EF4444" />
        {/* Darker Inner Spine Part */}
        <circle cx="50" cy="85" r="4" fill="#1E3A8A" stroke="#1F2937" strokeWidth="1.5" />

        {/* Pages - White/Cream Layer */}
        <path d="M15 40H50V80H15L15 40Z" fill="#FFFBEB" stroke="#1F2937" strokeWidth="2" strokeLinejoin="round" />
        <path d="M50 40H85V80H50L50 40Z" fill="#FFFBEB" stroke="#1F2937" strokeWidth="2" strokeLinejoin="round" />

        {/* Page Depth Lines */}
        <path d="M15 80L18 84H50V80H15Z" fill="#E2E8F0" stroke="#1F2937" strokeWidth="2" />
        <path d="M85 80L82 84H50V80H85Z" fill="#E2E8F0" stroke="#1F2937" strokeWidth="2" />

        {/* Page Inner Lines (Representing Text) */}
        <g stroke="#374151" strokeWidth="1.5" strokeLinecap="round">
          <line x1="22" y1="50" x2="43" y2="50" />
          <line x1="22" y1="58" x2="43" y2="58" />
          <line x1="22" y1="66" x2="35" y2="66" />
          <line x1="22" y1="74" x2="40" y2="74" />

          <line x1="57" y1="50" x2="78" y2="50" />
          <line x1="57" y1="58" x2="78" y2="58" />
          <line x1="57" y1="66" x2="70" y2="66" />
          <line x1="57" y1="74" x2="75" y2="74" />
        </g>
      </svg>
    </div>
  );
}
